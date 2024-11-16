import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
        : 'http://localhost:5000/api',
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add retry logic
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        if (error.code === 'ECONNABORTED' && !originalRequest._retry) {
            originalRequest._retry = true;
            return api(originalRequest);
        }

        if (error.response?.status === 503 && !originalRequest._retry) {
            originalRequest._retry = true;
            return new Promise(resolve => setTimeout(resolve, 1000))
                .then(() => api(originalRequest));
        }

        return Promise.reject(error);
    }
);

export default api; 