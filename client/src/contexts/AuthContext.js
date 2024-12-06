import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchData, endpoints } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const notify = useNotification();

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetchData(endpoints.auth.login, {
        method: 'POST',
        body: { email, password },
      });
      
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      notify.success('Successfully logged in');
      return response.data;
    } catch (error) {
      notify.error(error.message || 'Failed to login');
      throw error;
    }
  }, [notify]);

  const register = useCallback(async (userData) => {
    try {
      const response = await fetchData(endpoints.auth.register, {
        method: 'POST',
        body: userData,
      });
      
      notify.success('Registration successful');
      return response.data;
    } catch (error) {
      notify.error(error.message || 'Failed to register');
      throw error;
    }
  }, [notify]);

  const logout = useCallback(async () => {
    try {
      await fetchData(endpoints.auth.logout, { method: 'POST' });
      setUser(null);
      localStorage.removeItem('token');
      notify.success('Successfully logged out');
    } catch (error) {
      notify.error('Failed to logout');
      throw error;
    }
  }, [notify]);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetchData(endpoints.auth.me);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
