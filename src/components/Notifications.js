import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import notificationService from '../services/notificationService';

const NotificationContainer = styled.div`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
`;

const NotificationItem = styled.div`
  padding: 10px;
  margin-bottom: 10px;
  background-color: ${props => props.read ? '#fff' : '#e6f7ff'};
  border: 1px solid #d9d9d9;
  border-radius: 4px;
`;

const NotificationMessage = styled.p`
  margin: 0;
`;

const NotificationDate = styled.span`
  font-size: 0.8em;
  color: #888;
`;

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initial fetch
    notificationService.fetchNotifications()
      .then(data => setNotifications(data))
      .catch(error => console.error('Error fetching notifications:', error));

    // Subscribe to updates
    const unsubscribe = notificationService.subscribe(updatedNotifications => {
      setNotifications(updatedNotifications);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <NotificationContainer>
      <h2>Notifications ({notificationService.getUnreadCount()})</h2>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <>
          {notifications.some(n => !n.read) && (
            <button onClick={() => notificationService.markAllAsRead()}>
              Mark all as read
            </button>
          )}
          {notifications.map(notification => (
            <NotificationItem 
              key={notification._id} 
              read={notification.read} 
              onClick={() => handleMarkAsRead(notification._id)}
            >
              <NotificationMessage>{notification.message}</NotificationMessage>
              <NotificationDate>
                {new Date(notification.createdAt).toLocaleString()}
              </NotificationDate>
            </NotificationItem>
          ))}
        </>
      )}
    </NotificationContainer>
  );
}

export default Notifications;
