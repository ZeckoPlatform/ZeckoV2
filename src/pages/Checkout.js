import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const CheckoutContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
`;

const OrderSummary = styled.div`
  margin-top: 20px;
  border-top: 1px solid #ddd;
  padding-top: 20px;
`;

function Checkout() {
  const [cart, setCart] = useState({ items: [] });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: cart.items,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      // Clear the cart after successful order
      await fetch('/api/cart/clear', { method: 'POST' });
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <CheckoutContainer>
      <h1>Checkout</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Full Name"
          required
        />
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />
        <Input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Address"
          required
        />
        <Input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="City"
          required
        />
        <Input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleInputChange}
          placeholder="Postal Code"
          required
        />
        <Input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          placeholder="Country"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </Button>
      </Form>
      <OrderSummary>
        <h2>Order Summary</h2>
        {cart.items.map((item) => (
          <div key={item.product._id}>
            <p>{item.product.name} x {item.quantity} - ${item.product.price * item.quantity}</p>
          </div>
        ))}
        <h3>Total: ${total.toFixed(2)}</h3>
      </OrderSummary>
    </CheckoutContainer>
  );
}

export default Checkout;
