import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://zeckov2-deceb43992ac.herokuapp.com'
  : '';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    verify: '/api/auth/verify'
  },
  leads: {
    list: '/api/leads',
    get: (id) => `/api/leads/${id}`,
    create: '/api/leads',
    update: (id) => `/api/leads/${id}`,
    delete: (id) => `/api/leads/${id}`,
    latest: '/api/leads/latest',
    featured: '/api/leads/featured',
    proposals: (id) => `/api/leads/${id}/proposals`
  },
  categories: '/api/categories'
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

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;