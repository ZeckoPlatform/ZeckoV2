import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    verify: '/auth/verify'
  },
  leads: {
    list: '/leads',
    get: (id) => `/leads/${id}`,
    create: '/leads',
    update: (id) => `/leads/${id}`,
    delete: (id) => `/leads/${id}`,
    latest: '/leads/latest',
    proposals: (id) => `/leads/${id}/proposals`
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