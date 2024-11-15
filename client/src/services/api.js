import axios from 'axios';
import { API_URL } from '../config/apiConfig';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout and error handling
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 500
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
      return Promise.reject({ message: 'No response from server' });
    } else {
      // Error in request configuration
      console.error('Request error:', error.message);
      return Promise.reject({ message: 'Request configuration error' });
    }
  }
);

export default api; 