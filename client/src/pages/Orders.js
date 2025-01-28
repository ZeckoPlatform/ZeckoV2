import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for future API integration
    setLoading(false);
  }, []);

  if (loading) {
    return <Container>Loading orders...</Container>;
  }

  return (
    <Container>
      <Title>Orders</Title>
      <OrdersList>
        {orders.length === 0 ? (
          <EmptyState>No orders found.</EmptyState>
        ) : (
          orders.map(order => (
            <OrderCard key={order._id}>
              <OrderHeader>
                <h3>Order #{order._id}</h3>
                <StatusBadge status={order.status}>{order.status}</StatusBadge>
              </OrderHeader>
              <OrderDetails>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Total: ${order.total?.toFixed(2)}</p>
              </OrderDetails>
            </OrderCard>
          ))
        )}
      </OrdersList>
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

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OrderDetails = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatusBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return theme.colors.success.light;
      case 'pending':
        return theme.colors.warning.light;
      case 'cancelled':
        return theme.colors.error.light;
      default:
        return theme.colors.grey.light;
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return theme.colors.success.main;
      case 'pending':
        return theme.colors.warning.main;
      case 'cancelled':
        return theme.colors.error.main;
      default:
        return theme.colors.grey.main;
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export default Orders; 