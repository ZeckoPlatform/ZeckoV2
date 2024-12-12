import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('Attempting login...');
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);

      if (response?.data?.token && response?.data?.user) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 404) {
        throw new Error('Login service unavailable. Please try again later.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid input');
      } else {
        throw new Error('An error occurred during login. Please try again.');
      }
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login
  };

  // Don't render children until authentication is initialized
  if (loading) {
    return <div>Loading...</div>;
  }

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
