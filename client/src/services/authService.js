import api, { endpoints } from './api';

export const authService = {
  login: async (credentials) => {
    try {
      const email = typeof credentials.email === 'object' ? credentials.email.value : credentials.email;
      
      const loginData = {
        email,
        password: credentials.password
      };

      console.log('Login attempt with:', { ...loginData, password: '***' });
      const response = await api.post(endpoints.auth.login, loginData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post(endpoints.auth.logout);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
    }
  }
};

// ... other auth functions 