import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Spinner from './Spinner';

const PlansContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
`;

const PlanCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 250px;
  text-align: center;
`;

const PlanName = styled.h3`
  color: var(--primary-color);
  margin-bottom: 10px;
`;

const PlanPrice = styled.p`
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
`;

const PlanFeatures = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-bottom: 20px;
`;

const PlanFeature = styled.li`
  margin-bottom: 5px;
`;

const SelectButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
  margin-top: 20px;
`;

function SubscriptionPlans({ onSelectPlan }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/subscription-plans');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner aria-label="Loading subscription plans" />;

  if (error) return <ErrorMessage>{error} (Backend API not implemented yet)</ErrorMessage>;

  return (
    <PlansContainer>
      {plans.map((plan) => (
        <PlanCard key={plan.id}>
          <PlanName>{plan.name}</PlanName>
          <PlanPrice>${plan.price}/month</PlanPrice>
          <PlanFeatures>
            {plan.features.map((feature, index) => (
              <PlanFeature key={index}>{feature}</PlanFeature>
            ))}
          </PlanFeatures>
          <SelectButton onClick={() => onSelectPlan(plan)}>Select Plan</SelectButton>
        </PlanCard>
      ))}
    </PlansContainer>
  );
}

export default SubscriptionPlans;
