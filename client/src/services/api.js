import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Featured items API
export const getFeaturedItems = async () => {
  try {
    const response = await api.get('/products/featured');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured items:', error);
    throw error;
  }
};

// Other API exports
export const authApi = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const productApi = {
  getFeatured: getFeaturedItems,
  getAll: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api; 