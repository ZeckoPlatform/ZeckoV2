import React, { createContext, useContext, useState, useEffect } from 'react';
import { activityLogService } from '../services/activityLogService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          await activityLogService.initializeSocket();
        } catch (error) {
          console.error('Error initializing auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setError('Session expired. Please login again.');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (token, userData) => {
    try {
      const normalizedUserData = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        accountType: userData.accountType,
        businessName: userData.businessName
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUserData));
      setUser(normalizedUserData);
      await activityLogService.initializeSocket();
      setError(null);
    } catch (error) {
      console.error('Login error:', error);
      setError('Error logging in. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await activityLogService.disconnect();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/';
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    setError
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
