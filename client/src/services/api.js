import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
  : 'http://localhost:5000/api';

console.log('API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
  retries: 3,     // Number of retry attempts
  retryDelay: 1000, // Delay between retries in ms
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
});

// Request interceptor with retry logic
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for monitoring
    config.metadata = { startTime: new Date() };
    
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

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
    if (duration > 1000) { // Log slow requests (over 1s)
      console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
    }
    
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      duration: `${duration}ms`,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const { config } = error;
    
    // Skip retry for specific status codes
    if (error.response?.status === 401 || error.response?.status === 404) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    // Implement retry logic
    config.retryCount = config.retryCount || 0;
    
    if (config.retryCount < config.retries && 
        (error.response?.status === 503 || error.code === 'ECONNABORTED')) {
      config.retryCount += 1;
      
      console.log(`Retrying request (${config.retryCount}/${config.retries})`);
      
      // Exponential backoff
      const delay = config.retryDelay * Math.pow(2, config.retryCount - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Add timestamp for the retry
      config.metadata = { startTime: new Date() };
      
      return api(config);
    }
    
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      retryCount: config.retryCount
    });
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    try {
      console.log('Login URL:', `${BASE_URL}/auth/login`);
      const response = await api.post('/auth/login', credentials, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Login API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      console.error('API Error:', error.response || error);
      throw error;
    }
  },
};

export const productsAPI = {
  getAll: async (params) => {
    try {
      const response = await api.get('/products', { 
        params,
        timeout: 10000 // 10s timeout for product listing
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },
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

// Add a health check function
export const checkAPIHealth = async () => {
  try {
    const start = Date.now();
    await api.get('/health');
    const duration = Date.now() - start;
    console.log(`API health check successful (${duration}ms)`);
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default api; 