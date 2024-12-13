import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback(async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      // Set the token in the API instance
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    getCurrentUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
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
