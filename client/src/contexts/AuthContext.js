import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/verify');
          
          if (response.data.user) {
            console.log('Auth check successful:', response.data.user);
            setUser(response.data.user);
          } else {
            throw new Error('No user data in response');
          }
        } catch (error) {
          console.error('Auth check error:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
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
