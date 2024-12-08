import axios from 'axios';

// Create and export the API instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        // Handle specific errors
        if (error.response?.status === 503) {
            // Handle service unavailable
        }
        return Promise.reject(error);
    }
);

// API endpoints configuration
export const endpoints = {
  products: {
    list: (params) => `/products?${new URLSearchParams(params)}`,
    featured: '/products/featured',
  },
  jobs: {
    user: (userId) => `/jobs/user/${userId}`,
    featured: '/jobs/featured',
    list: '/jobs',
    details: (id) => `/jobs/${id}`,
    create: '/jobs',
    update: (id) => `/jobs/${id}`,
    delete: (id) => `/jobs/${id}`,
  },
  contractors: {
    featured: '/contractors/featured',
    list: '/contractors',
    details: (id) => `/contractors/${id}`,
    create: '/contractors',
    update: (id) => `/contractors/${id}`,
    delete: (id) => `/contractors/${id}`,
  },
  business: '/business',
  orders: {
    user: '/orders/user',
  },
  users: {
    addresses: '/users/addresses',
    profile: '/users/profile',
    update: '/users/profile',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  cart: '/cart',
};

// API methods
export const fetchData = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    return { data: response.data, error: null };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to fetch data'
    };
  }
};

export const postData = async (endpoint, data) => {
  try {
    const response = await api.post(endpoint, data);
    return { data: response.data, error: null };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return {
      data: null,
      error: error.response?.data?.message || 'Failed to submit data'
    };
  }
}; 