import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ProfileSection = styled.section`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const OrderHistory = styled.div`
  margin-top: 20px;
`;

const OrderCard = styled.div`
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 4px;

  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;

  &:disabled {
    background-color: #ccc;
  }
`;

function Profile() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (error) {
      setError('Error fetching orders');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ProfileContainer>
      <ProfileSection>
        <h1>My Profile</h1>
        <div>
          <h2>Account Information</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <Button onClick={() => logout()}>Logout</Button>
        </div>
      </ProfileSection>

      <ProfileSection>
        <h2>Order History</h2>
        <OrderHistory>
          {orders.length === 0 ? (
            <div>
              <p>No orders yet.</p>
              <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
            </div>
          ) : (
            orders.map(order => (
              <OrderCard key={order._id}>
                <h3>Order #{order._id}</h3>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                <Link to={`/order/${order._id}`}>View Details</Link>
              </OrderCard>
            ))
          )}
        </OrderHistory>
      </ProfileSection>

      <ProfileSection>
        <h2>Saved Addresses</h2>
        {/* Add saved addresses functionality here */}
        <p>Coming soon...</p>
      </ProfileSection>

      <ProfileSection>
        <h2>Payment Methods</h2>
        {/* Add payment methods functionality here */}
        <p>Coming soon...</p>
      </ProfileSection>
    </ProfileContainer>
  );
}

export default Profile;
