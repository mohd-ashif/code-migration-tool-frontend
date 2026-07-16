import axios from 'axios';
import { store } from '../../store';
import { setCredentials, logout } from '../../store/slices/authSlice';

export const API_KEY = 'your-api-key-here';

const apiClient = axios.create({
  baseURL: '', // Relative paths to match Vite's API proxy setting
  timeout: 30000, // 30 second timeout limit
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh & Response Extraction
let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  async (error: any) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
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
        // Direct call to refresh endpoint
        const refreshResponse = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        });

        const { accessToken, user } = refreshResponse.data.data;
        store.dispatch(setCredentials({ user, accessToken }));

        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    const customMessage = error.response?.data?.message || error.message || 'An unexpected API error occurred.';
    return Promise.reject(new Error(customMessage));
  }
);

export default apiClient;
