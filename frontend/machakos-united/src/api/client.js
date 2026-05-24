// src/api/client.js
import axios from 'axios';

// import.meta.env.VITE_API_BASE_URL reads from your .env file
// the || fallback means: if the variable is missing, use localhost:8000
// This prevents the silent "undefined baseURL" bug you just hit
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor ────────────────────────────────────────────────────
// Runs before EVERY request — attaches the JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      // Bearer token tells Django: "this user is authenticated"
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;  // must return config or the request won't be sent
  },
  (error) => Promise.reject(error)  // if the interceptor itself errors
);

// ── Response interceptor ───────────────────────────────────────────────────
// Runs after EVERY response — handles expired tokens automatically
apiClient.interceptors.response.use(
  (response) => response,  // 2xx responses pass through untouched

  async (error) => {
    const originalRequest = error.config;

    // 401 = Unauthorized = access token expired
    // _retry flag prevents infinite loops (don't retry a retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const storedRefresh = localStorage.getItem('refresh_token');
      if (storedRefresh) {
        try {
          // Use plain axios (not apiClient) to avoid triggering this interceptor again
          const { data } = await axios.post(`${baseURL}/token/refresh/`, {
            refresh: storedRefresh,
          });

          // Store the new access token
          localStorage.setItem('access_token', data.access);

          // Update the default header for all future requests
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;

          // Update the header on the failed request and retry it
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(originalRequest);

        } catch (refreshError) {
          // Refresh token also expired — force logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;