import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await axios.put('/api/auth/profile', userData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      setError
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
