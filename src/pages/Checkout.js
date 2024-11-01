import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const CheckoutContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ shippingAddress })
      });
      
      if (response.ok) {
        navigate('/order-confirmation');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <CheckoutContainer>
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Street Address"
          value={shippingAddress.street}
          onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="City"
          value={shippingAddress.city}
          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="State"
          value={shippingAddress.state}
          onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Zip Code"
          value={shippingAddress.zipCode}
          onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Country"
          value={shippingAddress.country}
          onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
          required
        />
        <button type="submit">Place Order</button>
      </form>
    </CheckoutContainer>
  );
}

export default Checkout;
