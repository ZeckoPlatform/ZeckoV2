import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Remove /api prefix if it exists in the URL since it's already in baseURL
    if (config.url?.startsWith('/api')) {
      config.url = config.url.substring(4);
    }
    console.log('API Request:', {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => api.get('/users/me'),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const cartAPI = {
  addToCart: (productId) => api.post('/cart/add', { productId }),
  getCart: () => api.get('/cart'),
  updateQuantity: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  deleteAccount: () => api.delete('/users/account'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  getAddresses: () => api.get('/users/addresses'),
};

// Add these endpoints
export const endpoints = {
  analytics: {
    users: '/analytics/users',
    orders: '/analytics/orders',
    revenue: '/analytics/revenue',
    growth: '/analytics/growth'
  },
  contractors: {
    list: '/contractors',
    details: (id) => `/contractors/${id}`
  },
  jobs: {
    list: '/jobs',
    details: (id) => `/jobs/${id}`
  },
  users: {
    profile: '/users/profile'
  }
};

// Add the fetchData utility function
export const fetchData = async (endpoint, options = {}) => {
  try {
    const response = await api.get(endpoint, options);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('API Error:', error);
    return { data: null, error: error.message };
  }
};

export default api; 