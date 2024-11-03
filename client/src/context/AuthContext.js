import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  const initializeSocket = useCallback((userId) => {
    if (!userId) return;

    const newSocket = io('https://zeckov2-deceb43992ac.herokuapp.com', {
      transports: ['websocket'],
      auth: {
        userId,
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      newSocket.emit('authenticate', { userId });
    });

    newSocket.on('notification', (data) => {
      // Handle notifications here
      console.log('Received notification:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      initializeSocket(data.user._id);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    navigate('/login');
  }, [navigate, socket]);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          initializeSocket(userData._id);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    };

    verifyToken();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [initializeSocket]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        socket
      }}
    >
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
