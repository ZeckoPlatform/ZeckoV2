import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Spinner from './Spinner';

const SubscriptionContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const SubscriptionHeader = styled.h2`
  color: var(--primary-color);
  margin-bottom: 20px;
`;

const PlanInfo = styled.div`
  margin-bottom: 20px;
`;

const PlanName = styled.h3`
  font-size: 1.2em;
  margin-bottom: 10px;
`;

const PlanDetails = styled.p`
  margin-bottom: 5px;
`;

const UpgradeButton = styled.button`
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
  margin-top: 10px;
`;

function SubscriptionInfo() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subscription info');
      }
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    // Implement upgrade functionality
    console.log('Upgrade clicked');
  };

  if (loading) return <Spinner aria-label="Loading subscription info" />;

  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <SubscriptionContainer>
      <SubscriptionHeader>Your Current Subscription</SubscriptionHeader>
      {subscription ? (
        <PlanInfo>
          <PlanName>{subscription.planName}</PlanName>
          <PlanDetails>Price: ${subscription.price}/month</PlanDetails>
          <PlanDetails>Features: {subscription.features.join(', ')}</PlanDetails>
          <PlanDetails>Next billing date: {new Date(subscription.nextBillingDate).toLocaleDateString()}</PlanDetails>
        </PlanInfo>
      ) : (
        <p>You don't have an active subscription.</p>
      )}
      <UpgradeButton onClick={handleUpgrade}>View Upgrade Options</UpgradeButton>
    </SubscriptionContainer>
  );
}

export default SubscriptionInfo;
