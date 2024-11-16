import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://zeckov2-deceb43992ac.herokuapp.com/api'
    : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Add request interceptor to include token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/verify');
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('accountType', user.accountType || 'personal');
      
      setUser(user);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('accountType', user.accountType || 'personal');
      
      setUser(user);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accountType');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await api.put('/auth/profile', userData);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      setError(message);
      throw new Error(message);
    }
  };

  // Add refresh token functionality
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      const { token } = response.data;
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      logout();
      throw new Error('Session expired');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      setError,
      refreshToken,
      checkAuthStatus
    }}>
      {children}
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
