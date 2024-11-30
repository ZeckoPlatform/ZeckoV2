import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
    : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

// API endpoints
export const endpoints = {
  products: {
    list: (params) => `/products?${new URLSearchParams(params)}`,
    featured: '/products/featured',
  },
  jobs: {
    user: (userId) => `/jobs/user/${userId}`,
  },
  business: '/business',
  orders: {
    user: '/orders/user',
  },
  users: {
    addresses: '/users/addresses',
  },
  cart: '/cart',
};

// API service functions
export const apiService = {
  async get(endpoint, params = {}) {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };
      const response = await api.get(endpoint, { ...config, params });
      return { data: response.data, error: null };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        data: null,
        error: error.response?.data?.message || 'Failed to fetch data'
      };
    }
  },

  async post(endpoint, data = {}) {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };
      const response = await api.post(endpoint, data, config);
      return { data: response.data, error: null };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        data: null,
        error: error.response?.data?.message || 'Failed to submit data'
      };
    }
  }
}; 