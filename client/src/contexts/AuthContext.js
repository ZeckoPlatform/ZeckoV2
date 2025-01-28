import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { endpoints } from '../services/api';
import { authService } from '../services/authService';
import axios from 'axios';

const AuthContext = createContext({
  user: null,
  userType: null, // 'user', 'business', or 'vendor'
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
});

const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    userType: null,
    isAuthenticated: false,
    loading: true
  });

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
    if (state.user) {
      const refreshInterval = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);
      return () => clearInterval(refreshInterval);
    }
  }, [state.user]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get(endpoints.users.profile);
          setState({
            user: response.data,
            userType: localStorage.getItem('userType'),
            isAuthenticated: true,
            loading: false
          });
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setState({
            user: null,
            userType: null,
            isAuthenticated: false,
            loading: false
          });
        }
      }
      setState({
        ...state,
        loading: false
      });
    };

    initAuth();
  }, []);

  const login = async (credentials, type) => {
    try {
      const endpoint = type === 'business' 
        ? '/api/auth/business/login'
        : type === 'vendor'
          ? '/api/auth/vendor/login'
          : '/api/auth/login';
          
      const response = await axios.post(endpoint, credentials);
      
      // If 2FA is required, return the response for the login component to handle
      if (response.data.require2FA) {
        return response.data;
      }

      // No 2FA required, proceed with normal login
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', type);
      
      setState({
        user,
        userType: type,
        isAuthenticated: true,
        loading: false
      });
      
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    delete api.defaults.headers.common['Authorization'];
    setState({
      user: null,
      userType: null,
      isAuthenticated: false,
      loading: true
    });
  };

  const updateUser = (userData) => {
    console.log('Updating user in context:', userData);
    setState({
      ...state,
      user: userData
    });
    // If you're storing in localStorage, update that too
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user: state.user,
    userType: state.userType,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    logout,
    error: state.error,
    setError: (error) => setState({ ...state, error }),
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!state.loading && children}
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
