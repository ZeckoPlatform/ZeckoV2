import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { socket, user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    const handleNotification = (data) => {
      try {
        setNotifications(prev => [...prev, data]);
      } catch (error) {
        console.error('Error handling notification:', error);
      }
    };

    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [socket, user]);

  return (
    <div>
      {notifications.map((notification, index) => (
        <div key={index}>
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
