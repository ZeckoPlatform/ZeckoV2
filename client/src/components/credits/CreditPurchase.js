import React, { useState } from 'react';
import styled from 'styled-components';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, CircularProgress, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PurchaseContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const PackageOption = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const creditPackages = [
  { credits: 10, price: 19.99 },
  { credits: 25, price: 44.99 },
  { credits: 50, price: 79.99 },
  { credits: 100, price: 149.99 }
];

const CreditPurchase = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      const pkg = creditPackages.find(p => p.credits.toString() === selectedPackage);
      
      const response = await api.post('/subscription/credits/purchase', {
        amount: pkg.price,
        credits: pkg.credits,
        paymentMethodId: paymentMethod.id
      });

      if (response.data.success) {
        navigate('/dashboard', { 
          state: { message: `Successfully purchased ${pkg.credits} credits!` }
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PurchaseContainer>
      <h2>Purchase Credits</h2>
      <form onSubmit={handleSubmit}>
        <RadioGroup
          value={selectedPackage}
          onChange={(e) => setSelectedPackage(e.target.value)}
        >
          {creditPackages.map(pkg => (
            <PackageOption key={pkg.credits}>
              <FormControlLabel
                value={pkg.credits.toString()}
                control={<Radio />}
                label={`${pkg.credits} Credits - $${pkg.price}`}
              />
            </PackageOption>
          ))}
        </RadioGroup>

        <div style={{ margin: '2rem 0' }}>
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
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!stripe || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Purchase Credits'}
        </Button>
      </form>
    </PurchaseContainer>
  );
};

export default CreditPurchase; 