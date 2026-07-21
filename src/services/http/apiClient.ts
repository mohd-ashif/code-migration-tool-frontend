import axios from 'axios';
import { store } from '../../store';
import { queryClient } from '../../app/providers/QueryProvider';
import { setCredentials, logout } from '../../store/slices/authSlice';
import { logger } from '../../utils/logger';
import { toast } from '../toast/toast.service';

export const API_KEY = 'your-api-key-here';

// ── Axios instance ────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: '',          // Relative paths — Vite proxies to backend
  timeout: 30_000,      // 30 s
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// ── Request interceptor: attach auth token + trace ID ────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    const { auth, workspace } = store.getState();
    if (auth.accessToken) {
      config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
    }

    // Attach active workspace ID to scope multi-tenant requests
    if (workspace.currentWorkspaceId) {
      config.headers['x-workspace-id'] = workspace.currentWorkspaceId;
    }

    // Inject session-scoped trace ID so requests can be correlated in logs
    config.headers['x-trace-id'] = logger.getTraceId();

    logger.info(`[API] → ${config.method?.toUpperCase()} ${config.url}`, {
      traceId: logger.getTraceId(),
    });

    return config;
  },
  (error) => {
    logger.error('[API] Request setup failed', error);
    return Promise.reject(error);
  },
);

// ── Token refresh queue ───────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token),
  );
  failedQueue = [];
};

// ── Centralised error message helper ─────────────────────────────────────────

function extractMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error  ||
      error.message ||
      'An unexpected API error occurred.'
    );
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

// ── Response interceptor: token refresh + error logging ───────────────────────

apiClient.interceptors.response.use(
  // Success path — unwrap the response envelope
  (response: any) => {
    logger.info(`[API] ← ${response.status} ${response.config.url}`);
    
    // Auto toast success for state-changing methods unless disabled
    const method = response.config.method?.toLowerCase();
    const isStateChanging = method === 'post' || method === 'put' || method === 'delete';
    const showToast = (response.config as any).showToast !== false;

    if (isStateChanging && showToast) {
      // Don't show toast for verification, session fetch, refresh token or other background calls
      const isBackground = 
        response.config.url?.includes('/api/auth/refresh') || 
        response.config.url?.includes('/api/auth/verify') ||
        response.config.url?.includes('/api/auth/session') ||
        response.config.url?.includes('/api/user/sessions');

      if (!isBackground) {
        const successMsg = response.data?.message || (
          method === 'post' ? 'Action completed successfully.' :
          method === 'put' ? 'Changes saved successfully.' :
          method === 'delete' ? 'Resource deleted successfully.' : ''
        );
        if (successMsg) {
          toast.success(successMsg);
        }
      }
    }
    
    return response.data;
  },

  // Error path
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      logger.error('[API] Non-axios error', error);
      return Promise.reject(error);
    }

    const originalRequest = error.config as any;
    const status = error.response?.status;

    logger.warn(`[API] ← ${status ?? 'ERR'} ${originalRequest?.url}`, {
      message: extractMessage(error),
    });

    // ── 401 → attempt token refresh ──────────────────────────────────────────
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/login') &&
      !originalRequest.url?.includes('/api/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          '/api/auth/refresh',
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_KEY,
              'x-trace-id': logger.getTraceId(),
            },
          },
        );

        const { accessToken, user } = refreshResponse.data.data;
        queryClient.setQueryData(['currentUser'], user);
        store.dispatch(setCredentials({ user, accessToken }));
        logger.info('[Auth] Token refreshed successfully.');

        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        store.dispatch(logout());
        logger.error('[Auth] Token refresh failed — logging out.', refreshError);
        return Promise.reject(refreshError);
      }
    }

    // ── All other errors: surface a clean message ─────────────────────────────
    const backendMessage = error.response?.data?.message || error.response?.data?.error;
    
    let userFriendlyMessage = 'A connection or network error occurred. Please check your internet connection.';

    if (status) {
      switch (status) {
        case 400:
          userFriendlyMessage = backendMessage || 'Invalid request. Please verify the provided details.';
          break;
        case 401:
          userFriendlyMessage = 'Session expired. Please log in again.';
          break;
        case 403:
          userFriendlyMessage = 'Access denied. You do not have permission for this resource.';
          break;
        case 404:
          userFriendlyMessage = 'Requested resource could not be found.';
          break;
        case 409:
          userFriendlyMessage = backendMessage || 'Conflict occurred. The resource might already exist.';
          break;
        case 422:
          userFriendlyMessage = backendMessage || 'Validation failed. Please correct the highlighted errors.';
          break;
        case 429:
          userFriendlyMessage = 'Too many requests. Please slow down and try again later.';
          break;
        case 500:
          userFriendlyMessage = 'Internal server error. Our engineering team has been notified.';
          break;
        case 503:
          userFriendlyMessage = 'Service temporarily unavailable. Please try again shortly.';
          break;
        default:
          userFriendlyMessage = backendMessage || 'An unexpected server error occurred.';
      }
    }

    const showToast = (originalRequest as any)?.showToast !== false;
    // Don't show redundant toasts for auth checking routes or refresh token calls
    const isBackground = 
      originalRequest?.url?.includes('/api/auth/refresh') || 
      originalRequest?.url?.includes('/api/auth/session');

    if (showToast && !isBackground) {
      toast.error(userFriendlyMessage);
    }

    return Promise.reject(new Error(userFriendlyMessage));
  },
);

export default apiClient;
