import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for future API integration
    setLoading(false);
  }, []);

  if (loading) {
    return <Container>Loading notifications...</Container>;
  }

  return (
    <Container>
      <Title>Notifications</Title>
      {notifications.length === 0 ? (
        <EmptyState>No notifications at the moment.</EmptyState>
      ) : (
        <NotificationsList>
          {notifications.map((notification, index) => (
            <NotificationItem key={index}>
              <NotificationContent>{notification.message}</NotificationContent>
              <NotificationTime>
                {new Date(notification.createdAt).toLocaleDateString()}
              </NotificationTime>
            </NotificationItem>
          ))}
        </NotificationsList>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 1rem;
`;

const Title = styled.h2`
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NotificationContent = styled.p`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const NotificationTime = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export default Notifications; 