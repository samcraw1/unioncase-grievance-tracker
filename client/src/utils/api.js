import axios from 'axios';

/**
 * Base API URL from environment variables
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Axios instance configured for the API
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor to add authentication token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle global errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

/**
 * Helper function to extract error message from API error
 * @param {Error} error - The error object from axios
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Helper function to handle API errors and show user-friendly messages
 * @param {Error} error - The error object from axios
 * @param {Function} setError - State setter function for error message
 */
export const handleApiError = (error, setError) => {
  const message = getErrorMessage(error);

  if (setError) {
    setError(message);
  }

  console.error('API Error:', error);
  return message;
};
