import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
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

  const login = async (credentials) => {
    try {
      setError(null);
      console.log('AuthContext: Attempting login with:', credentials);
      
      const response = await authService.login(credentials);
      console.log('AuthContext: Login response:', response);
      
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }

      const { token, user: userData } = response;

      // Normalize user data with proper casing
      const normalizedUser = {
        ...userData,
        accountType: userData.accountType || 'Regular',
        role: userData.role || 'user'
      };

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(normalizedUser);
      
      console.log('AuthContext: User set in context:', normalizedUser);
      return { success: true, user: normalizedUser };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      setError(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (newUserData) => {
    console.log('Updating user with:', newUserData);
    setUser(prevUser => {
      const updatedUser = typeof newUserData === 'function' 
        ? newUserData(prevUser)
        : { ...prevUser, ...newUserData };
      console.log('Updated user state:', updatedUser);
      return updatedUser;
    });
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
