import React, { createContext, useContext, useState, useEffect } from 'react';
import { activityLogService } from '../services/activityLogService';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
          navigate('/login');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [navigate]);

  const login = async (token, userData) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
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
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear everything even if there's an error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
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
