import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI, productsAPI } from '../services/api';
import { FaShoppingCart, FaTrash, FaArrowRight, FaStore } from 'react-icons/fa';
import { CircularProgress } from '@mui/material';

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
  const [cartData, setCartData] = useState({
    items: [],
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCartData = async () => {
      try {
        const response = await ordersAPI.getAll();
        const cartItems = response.data;
        const productDetails = await Promise.all(
          cartItems.map(item => productsAPI.getOne(item.productId))
        );
        
        setCartData({
          items: cartItems.map((item, index) => ({
            ...item,
            product: productDetails[index].data
          })),
          total: cartItems.reduce((sum, item) => sum + item.price, 0)
        });
      } catch (error) {
        console.error('Error loading cart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCartData();
  }, []);

  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCart(productId);
      loadCart(); // Reload cart after removal
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

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
      {cartData.items.length === 0 ? (
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
          {cartData.items.map((item) => (
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
          <h3>Total: ${cartData.total ? cartData.total.toFixed(2) : '0.00'}</h3>
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
