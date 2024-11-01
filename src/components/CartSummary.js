import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const CartContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const CartIcon = styled.span`
  font-size: 1.5rem;
  cursor: pointer;
`;

const CartCount = styled.span`
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.8rem;
`;

const CartSummary = () => {
  const [itemCount, setItemCount] = useState(0);
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart/count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setItemCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  return (
    <CartContainer>
      <Link to="/cart">
        <CartIcon>🛒</CartIcon>
        {itemCount > 0 && <CartCount>{itemCount}</CartCount>}
      </Link>
    </CartContainer>
  );
};

export default CartSummary;
