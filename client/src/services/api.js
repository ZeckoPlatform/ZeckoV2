import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
        : 'http://localhost:5000/api',
    timeout: 10000,
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

// API methods
const apiMethods = {
    getFeaturedItems: async () => {
        try {
            const response = await api.get('/products/featured');
            return response.data;
        } catch (error) {
            console.error('Error fetching featured items:', error);
            throw error;
        }
    },

    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            // Store the token in localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                // Add token to default headers for subsequent requests
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    },

    // Add this to verify token on app load
    checkAuth: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await api.get('/auth/verify');
            return response.data;
        } catch (error) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            throw error;
        }
    }
};

// Export the api instance and methods
export default api;
export const { getFeaturedItems, login, logout, checkAuth } = apiMethods; 