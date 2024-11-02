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
    let subscription = null;

    const initializeSocket = async () => {
      if (user) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            socketService.connect(token);
            const observable = socketService.getNotificationObservable();
            subscription = observable.subscribe({
              next: handleNotification,
              error: (error) => console.error('Notification error:', error)
            });
          } catch (error) {
            console.error('Socket initialization error:', error);
          }
        }
      }
    };

    initializeSocket();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      socketService.disconnect();
    };
  }, [user, handleNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
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