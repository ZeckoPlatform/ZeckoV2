import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const OrderContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const OrderSummary = styled.div`
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const AddressForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin: 10px 0;
`;

function OrderCreation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch cart items');
      const data = await response.json();
      setCartItems(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
          })),
          shippingAddress: address,
          totalAmount: calculateTotal()
        })
      });

      if (!response.ok) throw new Error('Failed to create order');

      // Clear cart after successful order
      await fetch('/api/cart/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      navigate('/order-confirmation');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (cartItems.length === 0) return <div>Your cart is empty</div>;

  return (
    <OrderContainer>
      <h1>Create Order</h1>
      
      <OrderSummary>
        <h2>Order Summary</h2>
        {cartItems.map(item => (
          <div key={item.product._id}>
            <p>{item.product.name} x {item.quantity}</p>
            <p>${(item.product.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        <h3>Total: ${calculateTotal().toFixed(2)}</h3>
      </OrderSummary>

      <AddressForm onSubmit={handleSubmit}>
        <h2>Shipping Address</h2>
        <Input
          type="text"
          name="street"
          placeholder="Street Address"
          value={address.street}
          onChange={handleAddressChange}
          required
        />
        <Input
          type="text"
          name="city"
          placeholder="City"
          value={address.city}
          onChange={handleAddressChange}
          required
        />
        <Input
          type="text"
          name="state"
          placeholder="State"
          value={address.state}
          onChange={handleAddressChange}
          required
        />
        <Input
          type="text"
          name="zipCode"
          placeholder="ZIP Code"
          value={address.zipCode}
          onChange={handleAddressChange}
          required
        />
        <Input
          type="text"
          name="country"
          placeholder="Country"
          value={address.country}
          onChange={handleAddressChange}
          required
        />
        
        <Button type="submit">
          Place Order
        </Button>
      </AddressForm>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </OrderContainer>
  );
}

export default OrderCreation; 