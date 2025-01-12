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
    login: '/users/login',
    register: '/users/register',
    verify: '/users/verify-2fa',
    logout: '/users/logout',
    refresh: '/users/refresh-token'
  },
  users: {
    profile: '/users/profile',
    addresses: '/users/addresses',
    security: '/users/security-settings',
    avatar: '/users/profile/avatar'
  },
  leads: {
    list: '/leads',
    create: '/leads',
    get: (id) => `/leads/${id}`,
    update: (id) => `/leads/${id}`,
    delete: (id) => `/leads/${id}`,
    latest: '/leads/latest'
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