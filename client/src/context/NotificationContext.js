import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

// Export the context itself
export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
        
        const unsubscribe = socketService.subscribe((notification) => {
          setNotifications(prev => [...prev, notification]);
          // Play sound if needed
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Audio play failed:', e));
        });

        return () => {
          unsubscribe();
          socketService.disconnect();
        };
      }
    } else {
      socketService.disconnect();
    }
  }, [user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 