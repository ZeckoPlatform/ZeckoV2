import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Bell, X } from 'react-feather';
import { useAuth } from '../context/AuthContext';
import { playNotificationSound } from '../services/notificationSound';

const NotificationContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const NotificationIcon = styled.div`
  cursor: pointer;
  position: relative;
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
`;

const NotificationPanel = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  display: ${props => props.show ? 'block' : 'none'};
`;

const NotificationItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  
  &:hover {
    background: #f5f5f5;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const EmptyNotification = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
`;

const Notifications = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { socket, user } = useAuth();
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('notificationsMuted') === 'true';
    } catch (error) {
      console.error('Error reading mute state:', error);
      return false;
    }
  });

  useEffect(() => {
    if (!socket || !user) {
      return; // Exit early if dependencies aren't ready
    }

    const handleNotification = (data) => {
      try {
        setNotifications(prev => [...prev, data]);
        if (!isMuted && data) {
          playNotificationSound();
        }
      } catch (error) {
        console.error('Error handling notification:', error);
      }
    };

    try {
      socket.on('notification', handleNotification);
      fetchNotifications();

      return () => {
        socket.off('notification', handleNotification);
      };
    } catch (error) {
      console.error('Error setting up socket listener:', error);
    }
  }, [socket, user, isMuted]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error('Received invalid notifications data:', data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]); // Set to empty array on error
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContainer>
      <NotificationIcon onClick={() => setShowPanel(!showPanel)}>
        <Bell size={20} />
        {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
      </NotificationIcon>

      <NotificationPanel show={showPanel}>
        {notifications.length === 0 ? (
          <EmptyNotification>No notifications</EmptyNotification>
        ) : (
          notifications.map(notification => (
            <NotificationItem 
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              style={{ 
                background: notification.read ? 'white' : '#f0f7ff'
              }}
            >
              <div>{notification.message}</div>
              <small>{new Date(notification.createdAt).toLocaleString()}</small>
            </NotificationItem>
          ))
        )}
      </NotificationPanel>
    </NotificationContainer>
  );
};

export default Notifications;
