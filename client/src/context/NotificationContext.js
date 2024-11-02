import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

// Export the context itself
export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const handleNotification = useCallback((notification) => {
    if (!notification) return;
    
    setNotifications(prev => [...prev, notification]);
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (error) {
      // Silently fail if audio fails
    }
  }, []);

  useEffect(() => {
    let cleanup = null;
    
    if (user?._id) {
      try {
        socketService.initialize(user._id);
        cleanup = socketService.addNotificationHandler(handleNotification);
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    }

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [user, handleNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      clearNotifications 
    }}>
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