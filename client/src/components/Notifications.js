import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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

  const renderNotification = (notification) => {
    switch (notification.type) {
      case 'proposal_received':
        return {
          message: 'New proposal received for your lead',
          link: `/leads/${notification.leadId}`
        };
      case 'proposal_accepted':
        return {
          message: 'Your proposal has been accepted!',
          link: `/leads/${notification.leadId}`
        };
      case 'proposal_rejected':
        return {
          message: 'Your proposal was not selected',
          link: `/leads/${notification.leadId}`
        };
      default:
        return notification;
    }
  };

  return (
    <div>
      {notifications.map((notification, index) => (
        <div key={index}>
          {renderNotification(notification).message}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
