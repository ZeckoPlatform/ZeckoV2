import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { endpoints } from '../services/api';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshToken = async () => {
    try {
      const response = await api.post(endpoints.auth.refresh);
      const { token } = response.data;
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  useEffect(() => {
    if (user) {
      const refreshInterval = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);
      return () => clearInterval(refreshInterval);
    }
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get(endpoints.users.profile);
          setUser(response.data);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Login attempt with:', { email, password: '***' });
      
      const response = await api.post(endpoints.auth.login, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      if (response.data.requiresTwoFactor) {
        // Handle 2FA if needed
        return response.data;
      }
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData) => {
    console.log('Updating user in context:', userData);
    setUser(userData);
    // If you're storing in localStorage, update that too
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    setError,
    isAuthenticated: !!user,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
