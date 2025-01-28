import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, CircularProgress } from '@mui/material';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { getCreditBalance } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const BalanceContainer = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  text-align: center;
`;

const Credits = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
  margin: 1rem 0;
`;

const CreditBalance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const { balance } = await getCreditBalance();
        setBalance(balance);
      } catch (err) {
        setError('Failed to load credit balance');
        console.error('Error fetching balance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <BalanceContainer>
      <h3>Credit Balance</h3>
      <Credits>{balance}</Credits>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => navigate('/credits/purchase')}
      >
        Buy More Credits
      </Button>
    </BalanceContainer>
  );
};

export default CreditBalance; 