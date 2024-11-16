import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 15000,
  validateStatus: status => status >= 200 && status < 500
});

// Request interceptor with optimized caching
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add cache busting only for GET requests
  if (config.method === 'get') {
    config.params = { 
      ...config.params,
      _t: Date.now()
    };
  }

  return config;
});

// Response interceptor with improved error handling
api.interceptors.response.use(
  response => {
    // Handle 304 Not Modified
    if (response.status === 304) {
      return response;
    }
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      toast.error(
        error.response?.data?.message || 
        'An unexpected error occurred'
      );
    }

    return Promise.reject(error);
  }
);

export default api; 