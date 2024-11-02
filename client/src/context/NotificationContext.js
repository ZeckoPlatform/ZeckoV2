import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

// Export the context itself
export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const handleNotification = useCallback((notification) => {
    setNotifications(prev => [...prev, notification]);
    
    // Try to play notification sound
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      // Initialize socket connection
      socketService.initialize(user.id);
      
      // Add notification handler
      const cleanup = socketService.addNotificationHandler(handleNotification);

      return () => {
        if (cleanup) cleanup();
        socketService.disconnect();
      };
    }
  }, [user, handleNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      clearNotifications,
      addNotification: handleNotification // Export the handler if needed
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