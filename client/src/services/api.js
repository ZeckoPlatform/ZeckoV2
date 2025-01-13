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
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    verify: '/auth/verify'
  },
  users: {
    profile: '/users/profile',
    update: '/users/update'
  },
  leads: {
    list: '/leads',
    get: (id) => `/leads/${id}`,
    create: '/leads',
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