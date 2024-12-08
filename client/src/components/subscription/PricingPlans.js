import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '@mui/material';
import { api } from '../../services/api';

const PlansContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const PlanCard = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

const PlanTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 1rem;
`;

const PlanPrice = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 1rem 0;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  text-align: left;
`;

const Feature = styled.li`
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;

  &:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49.99,
    credits: 10,
    features: [
      'View leads in your area',
      '10 monthly credits',
      'Basic profile listing',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 99.99,
    credits: 25,
    features: [
      'All Basic features',
      '25 monthly credits',
      'Priority profile listing',
      'Priority support',
      'Analytics dashboard'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299.99,
    credits: 100,
    features: [
      'All Pro features',
      '100 monthly credits',
      'Featured profile listing',
      '24/7 Premium support',
      'Custom branding',
      'Team accounts'
    ]
  }
];

const PricingPlans = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/subscription/plans' } });
      return;
    }

    try {
      // Navigate to checkout page with plan details
      navigate('/subscription/checkout', { state: { planId } });
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <PlansContainer>
      {plans.map((plan) => (
        <PlanCard key={plan.id}>
          <PlanTitle>{plan.name}</PlanTitle>
          <PlanPrice>${plan.price}<span>/month</span></PlanPrice>
          <div>{plan.credits} credits/month</div>
          <FeatureList>
            {plan.features.map((feature, index) => (
              <Feature key={index}>{feature}</Feature>
            ))}
          </FeatureList>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSubscribe(plan.id)}
          >
            {user?.subscription?.plan === plan.id ? 'Current Plan' : 'Subscribe'}
          </Button>
        </PlanCard>
      ))}
    </PlansContainer>
  );
};

export default PricingPlans; 