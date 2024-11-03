import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  const logout = () => {
    // Clear user data
    setUser(null);
    
    // Clear token
    localStorage.removeItem('token');
    
    // Close socket connection if it exists
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io(process.env.REACT_APP_API_URL || '', {
        auth: { token },
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, socket, logout }}>
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

export default AuthProvider;
