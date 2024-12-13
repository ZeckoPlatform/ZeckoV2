import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch orders if the endpoint exists
        try {
          const ordersResponse = await api.get('/orders');
          setOrders(ordersResponse.data);
        } catch (err) {
          console.log('Orders endpoint not available yet');
          setOrders([]);
        }

        // Fetch notifications if the endpoint exists
        try {
          const notificationsResponse = await api.get('/notifications');
          setNotifications(notificationsResponse.data);
        } catch (err) {
          console.log('Notifications endpoint not available yet');
          setNotifications([]);
        }

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardContainer>Loading...</DashboardContainer>;
  }

  if (error) {
    return <DashboardContainer>{error}</DashboardContainer>;
  }

  return (
    <DashboardContainer>
      <WelcomeSection>
        <h1>Welcome, {user?.username || 'User'}!</h1>
      </WelcomeSection>

      <DashboardSection>
        <h2>Your Orders</h2>
        {orders.length > 0 ? (
          <OrdersList>
            {orders.map(order => (
              <OrderItem key={order.id}>
                {/* Add order details here */}
              </OrderItem>
            ))}
          </OrdersList>
        ) : (
          <EmptyState>No orders yet</EmptyState>
        )}
      </DashboardSection>

      <DashboardSection>
        <h2>Notifications</h2>
        {notifications.length > 0 ? (
          <NotificationsList>
            {notifications.map(notification => (
              <NotificationItem key={notification.id}>
                {/* Add notification details here */}
              </NotificationItem>
            ))}
          </NotificationsList>
        ) : (
          <EmptyState>No notifications</EmptyState>
        )}
      </DashboardSection>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
  h1 {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const DashboardSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const OrdersList = styled.div`
  display: grid;
  gap: 1rem;
`;

const OrderItem = styled.div`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 4px;
`;

const NotificationsList = styled.div`
  display: grid;
  gap: 1rem;
`;

const NotificationItem = styled.div`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 2rem;
`;

export default Dashboard;