import axios from 'axios';
import { errorHandler } from './error/ErrorHandler';
import { toast } from 'react-toastify';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
  : 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.params = { ...config.params, _t: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Received HTML response instead of JSON');
    }
    return response;
  },
  (error) => Promise.reject(errorHandler.handle(error, toast))
);

const api = {
  // Auth
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (userData) => axiosInstance.post('/auth/register', userData),
  
  // Profile
  getProfile: () => axiosInstance.get('/users/profile'),
  updateProfile: (data) => axiosInstance.put('/users/profile', data),
  
  // Jobs
  getJobs: (params) => axiosInstance.get('/jobs', { params }),
  getUserJobs: (params) => axiosInstance.get('/jobs/user', { params }),
  createJob: (jobData) => axiosInstance.post('/jobs', jobData),
  updateJob: (id, jobData) => axiosInstance.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => axiosInstance.delete(`/jobs/${id}`),
  getJobById: (id) => axiosInstance.get(`/jobs/${id}`),
  searchJobs: (params) => axiosInstance.get('/jobs/search', { params }),
  
  // Leads
  getLeads: (params) => axiosInstance.get('/leads', { params }),
  getUserLeads: (params) => axiosInstance.get('/leads/user', { params }),
  createLead: (leadData) => axiosInstance.post('/leads', leadData),
  updateLead: (id, leadData) => axiosInstance.put(`/leads/${id}`, leadData),
  deleteLead: (id) => axiosInstance.delete(`/leads/${id}`),
  getLeadById: (id) => axiosInstance.get(`/leads/${id}`),
  searchLeads: (params) => axiosInstance.get('/leads/search', { params }),
  
  // Products
  getProducts: (params) => axiosInstance.get('/products', { params }),
  createProduct: (productData) => axiosInstance.post('/products', productData),
  updateProduct: (id, productData) => axiosInstance.put(`/products/${id}`, productData),
  deleteProduct: (id) => axiosInstance.delete(`/products/${id}`),
  getProductById: (id) => axiosInstance.get(`/products/${id}`),
  
  // User
  getUserProfile: () => axiosInstance.get('/users/me'),
  updateUserProfile: (profileData) => axiosInstance.put('/users/profile', profileData),
  getUserSecuritySettings: () => axiosInstance.get('/users/security-settings'),
  getUserAddresses: () => axiosInstance.get('/users/addresses')
};

export default api;