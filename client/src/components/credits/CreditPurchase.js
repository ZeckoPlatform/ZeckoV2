import React, { useState } from 'react';
import styled from 'styled-components';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, CircularProgress, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmCreditPurchase } from '../../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

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

const CreditPurchaseForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // Get payment intent
      const { clientSecret } = await createPaymentIntent(amount);

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        onError(error.message);
        return;
      }

      // Confirm credit purchase
      await confirmCreditPurchase(paymentIntent.id, amount);
      onSuccess();
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
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
        }}/>
      </div>
      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="btn btn-primary mt-3"
      >
        {loading ? 'Processing...' : `Purchase ${amount} Credits`}
      </button>
    </form>
  );
};

const CreditPurchase = () => {
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState('');

  const handleSuccess = () => {
    setMessage('Credits purchased successfully!');
    // Optionally refresh credit balance here
  };

  const handleError = (error) => {
    setMessage(`Error: ${error}`);
  };

  return (
    <div className="credit-purchase-container">
      <h2>Purchase Credits</h2>
      <div className="amount-selector mb-4">
        <label>Select Amount:</label>
        <select 
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))}
          className="form-select"
        >
          <option value={100}>100 Credits - $100</option>
          <option value={200}>200 Credits - $200</option>
          <option value={500}>500 Credits - $500</option>
        </select>
      </div>
      
      <Elements stripe={stripePromise}>
        <CreditPurchaseForm 
          amount={amount}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </Elements>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} mt-3`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default CreditPurchase; 