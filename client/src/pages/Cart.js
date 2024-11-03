import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { fetchCart, removeFromCart } from '../services/cartService';

const CartContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const CartItem = styled.div`
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 8px 16px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.checkout ? '#4CAF50' : '#ff4444'};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await fetchCart();
      setCart(cartData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCart(productId);
      loadCart(); // Reload cart after removal
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) return <CartContainer>Loading...</CartContainer>;
  if (error) return <CartContainer>Error: {error}</CartContainer>;
  if (!user) {
    return (
      <CartContainer>
        <h1>Shopping Cart</h1>
        <p>Please log in to view your cart</p>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <h1>Shopping Cart</h1>
      {cart.items.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link to="/shop">
            <Button checkout>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div>
          {cart.items.map((item) => (
            <CartItem key={item.product._id}>
              <h3>{item.product.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${(item.product.price * item.quantity).toFixed(2)}</p>
              <Button onClick={() => handleRemoveFromCart(item.product._id)}>
                Remove
              </Button>
            </CartItem>
          ))}
          <h3>Total: ${cart.total ? cart.total.toFixed(2) : '0.00'}</h3>
          <Link to="/checkout">
            <Button checkout>Proceed to Checkout</Button>
          </Link>
        </div>
      )}
    </CartContainer>
  );
}

export default Cart;
