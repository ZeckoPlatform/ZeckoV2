import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const ConfirmationContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
`;

const Button = styled(Link)`
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  margin-top: 20px;
`;

function OrderConfirmation() {
  return (
    <ConfirmationContainer>
      <h1>Order Confirmed!</h1>
      <p>Thank you for your purchase. Your order has been received and is being processed.</p>
      <Button to="/">Continue Shopping</Button>
    </ConfirmationContainer>
  );
}

export default OrderConfirmation;
