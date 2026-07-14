import axios from 'axios';

export const API_KEY = 'your-api-key-here';

const apiClient = axios.create({
  baseURL: '', // Relative paths to match Vite's API proxy setting
  timeout: 30000, // 30 second timeout limit
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Add interceptors to automatically extract response data and normalize errors
apiClient.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  (error: any) => {
    const customMessage = error.response?.data?.message || error.message || 'An unexpected API error occurred.';
    return Promise.reject(new Error(customMessage));
  }
);

export default apiClient;
