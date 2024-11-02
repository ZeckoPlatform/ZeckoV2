import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

// Export the context itself
export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const handleNotification = useCallback((notification) => {
    console.log('Handling notification:', notification);
    setNotifications(prev => [...prev, notification]);
    
    // Play notification sound
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  useEffect(() => {
    let removeHandler = null;

    if (user?.id) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          socketService.initialize(user.id);
          removeHandler = socketService.addNotificationHandler(handleNotification);
        } catch (error) {
          console.error('Socket initialization error:', error);
        }
      }
    }

    return () => {
      if (removeHandler) {
        removeHandler();
      }
      socketService.disconnect();
    };
  }, [user, handleNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

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