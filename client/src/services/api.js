import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Handle trial expiration (403 with specific error code)
    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.error?.code;

      if (errorCode === 'TRIAL_EXPIRED' || errorCode === 'SUBSCRIPTION_INACTIVE') {
        // Redirect to trial expired page
        window.location.href = '/trial-expired';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
