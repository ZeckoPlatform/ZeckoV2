import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
  : 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
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

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
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
  
  // Search
  searchJobs: (params) => axiosInstance.get('/jobs/search', { params }),
  
  // Products (if needed)
  getProducts: (params) => axiosInstance.get('/products', { params }),
};

export default api;