import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
        : '/api'
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`
            };
        }

        // Only set Content-Type if it's not FormData
        if (!(config.data instanceof FormData)) {
            config.headers = {
                ...config.headers,
                'Content-Type': 'application/json'
            };
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;