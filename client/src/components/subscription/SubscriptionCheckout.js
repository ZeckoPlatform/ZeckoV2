import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, CircularProgress } from '@mui/material';
import { api } from '../../services/api';

const CheckoutContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CardContainer = styled.div`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-top: 0.5rem;
`;

const SubscriptionCheckout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const planId = location.state?.planId;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Create subscription
      const response = await api.post('/subscription/subscribe', {
        planId,
        paymentMethodId: paymentMethod.id
      });

      if (response.data.success) {
        navigate('/dashboard', { 
          state: { message: 'Subscription activated successfully!' }
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CheckoutContainer>
      <h2>Complete Subscription</h2>
      <Form onSubmit={handleSubmit}>
        <CardContainer>
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </CardContainer>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!stripe || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Subscribe Now'}
        </Button>
      </Form>
    </CheckoutContainer>
  );
};

export default SubscriptionCheckout; 