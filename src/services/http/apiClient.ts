import axios from 'axios';
import { store } from '../../store';
import { queryClient } from '../../app/providers/QueryProvider';
import { setCredentials, logout } from '../../store/slices/authSlice';
import { logger } from '../../utils/logger';

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
    const { auth } = store.getState();
    if (auth.accessToken) {
      config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
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
    const customMessage = extractMessage(error);
    return Promise.reject(new Error(customMessage));
  },
);

export default apiClient;
