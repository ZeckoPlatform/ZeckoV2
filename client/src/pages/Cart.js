import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI, productsAPI, cartAPI } from '../services/api';
import { FaShoppingCart, FaTrash, FaArrowRight, FaStore } from 'react-icons/fa';
import { CircularProgress } from '@mui/material';
import { useNotification } from '../contexts/NotificationContext';

const CartContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const CartHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  
  h1 {
    margin: 0;
  }
  
  svg {
    font-size: 24px;
    color: #4CAF50;
  }
`;

const CartItem = styled.div`
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button`
  padding: 8px 16px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.checkout ? '#4CAF50' : '#ff4444'};
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    opacity: 0.9;
  }

  svg {
    font-size: 16px;
  }
`;

const CartButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.status.success};
  
  svg {
    font-size: ${({ theme }) => theme.typography.size.md};
  }
`;

const ItemDetails = styled.div`
  flex-grow: 1;
`;

const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const loadCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCartItems(response.data);
    } catch (error) {
      showNotification('Failed to load cart', 'error');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      await loadCart();
      showNotification('Item removed from cart', 'success');
    } catch (error) {
      showNotification('Failed to remove item', 'error');
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }
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
      <CartHeader>
        <FaShoppingCart />
        <h1>Shopping Cart</h1>
      </CartHeader>
      {cartItems.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link to="/shop">
            <CartButton>
              <FaShoppingCart />
              Continue Shopping
            </CartButton>
          </Link>
        </div>
      ) : (
        <div>
          {cartItems.map((item) => (
            <CartItem key={item.product._id}>
              <ItemDetails>
                <h3>{item.product.name}</h3>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${(item.product.price * item.quantity).toFixed(2)}</p>
              </ItemDetails>
              <ItemActions>
                <Button onClick={() => handleRemoveFromCart(item.product._id)}>
                  <FaTrash />
                  Remove
                </Button>
              </ItemActions>
            </CartItem>
          ))}
          <h3>Total: ${cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</h3>
          <Link to="/checkout">
            <CartButton>
              Proceed to Checkout
              <FaArrowRight />
            </CartButton>
          </Link>
        </div>
      )}
    </CartContainer>
  );
}

export default Cart;
