import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Define API endpoints
export const endpoints = {
  auth: {
    login: '/api/users/login',
    register: '/api/users/register',
    verify: '/api/users/verify-2fa',
    logout: '/api/users/logout',
    refresh: '/api/users/refresh-token'
  },
  users: {
    profile: '/api/users/profile',
    addresses: '/api/users/addresses',
    security: '/api/users/security-settings',
    avatar: '/api/users/profile/avatar'
  },
  leads: {
    list: '/api/leads',
    create: '/api/leads',
    get: '/api/leads',
    update: '/api/leads',
    delete: '/api/leads',
    latest: '/api/leads'
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