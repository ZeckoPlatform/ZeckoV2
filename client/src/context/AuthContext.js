import React, { createContext, useContext, useState, useEffect } from 'react';
import { logActivity, ActivityTypes } from '../utils/activityLogger';
import axios from 'axios';

// Add this near the top
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create and export the context
export const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      await logActivity(ActivityTypes.LOGIN, 'Successful login');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await logActivity(ActivityTypes.SECURITY, 'Changed password');
    } catch (error) {
      // ... error handling ...
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    changePassword,
    loading
  };

  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>; // You might want to replace this with a proper loading component
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
