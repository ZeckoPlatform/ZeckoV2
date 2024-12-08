import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, CircularProgress } from '@mui/material';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

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
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await api.get('/subscription/credits/balance');
      setCredits(response.data.credits);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <BalanceContainer>
      <h3>Credit Balance</h3>
      <Credits>{credits}</Credits>
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