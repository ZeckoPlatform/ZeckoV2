import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/verify');
          
          // Ensure user data is properly structured
          const userData = {
            ...response.data.user,
            accountType: response.data.user.accountType || 'regular'
          };
          
          console.log('Auth check user data:', userData);
          setUser(userData);
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
      console.log('Attempting login with:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      const { token, user: userData } = response.data;

      // Ensure user data is properly structured
      const normalizedUser = {
        ...userData,
        accountType: userData.accountType || 'regular',
        role: userData.role || 'user'
      };

      if (!normalizedUser) {
        throw new Error('Invalid user data received');
      }

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(normalizedUser);
      
      console.log('User set in context:', normalizedUser);
      return { user: normalizedUser, token };
    } catch (error) {
      console.error('Login error:', error);
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
    isAuthenticated: !!user
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
