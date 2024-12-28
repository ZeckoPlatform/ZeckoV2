import axios from 'axios';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Define API endpoints
export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    verify: '/api/auth/verify',
    logout: '/api/auth/logout'
  },
  users: {
    profile: '/api/users/profile',
    addresses: '/api/users/addresses',
    security: '/api/users/security-settings',
    avatar: '/api/users/profile/avatar'
  }
};

// Add request interceptor for auth token
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

export default api;