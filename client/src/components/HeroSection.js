import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroContainer = styled.section`
  background: linear-gradient(135deg, #006400 25%, #228B22 50%, #32CD32 100%);
  position: relative;
  color: white;
  padding: 160px 20px 100px;
  text-align: center;
  overflow: hidden;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const SubscriptionTiers = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 50px;
  flex-wrap: wrap;
  
  @media (max-width: 1200px) {
    gap: 20px;
  }
`;

const TierCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  width: 300px;
  color: #006400;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const TierHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const TierTitle = styled.h3`
  font-size: 1.8rem;
  color: #006400;
  margin-bottom: 10px;
`;

const TierPrice = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #228B22;
  
  span {
    font-size: 1rem;
    opacity: 0.8;
  }
`;

const TierFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;

  li {
    padding: 8px 0;
    color: #333;
    display: flex;
    align-items: center;
    
    &:before {
      content: "✓";
      color: #228B22;
      margin-right: 10px;
      font-weight: bold;
    }
  }
`;

const TierButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background: #006400;
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: bold;
  transition: background 0.3s ease;

  &:hover {
    background: #008000;
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -15px;
  right: -15px;
  background: #ff4757;
  color: white;
  padding: 8px 15px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: bold;
`;

export function HeroSection() {
  return (
    <HeroContainer>
      <HeroContent>
        <HeroTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to Zecko
        </HeroTitle>
        <HeroSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Powering Trade Services: Where Professionals Connect, Products Flow, and Business Grows
        </HeroSubtitle>

        <SubscriptionTiers>
          <TierCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TierHeader>
              <TierTitle>Basic</TierTitle>
              <TierPrice>$9.99<span>/month</span></TierPrice>
            </TierHeader>
            <TierFeatures>
              <li>5 Job Postings</li>
              <li>Basic Analytics</li>
              <li>Email Support</li>
              <li>Profile Customization</li>
            </TierFeatures>
            <TierButton to="/register?plan=basic">Choose Basic</TierButton>
          </TierCard>

          <TierCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ position: 'relative' }}
          >
            <PopularBadge>Most Popular</PopularBadge>
            <TierHeader>
              <TierTitle>Professional</TierTitle>
              <TierPrice>$24.99<span>/month</span></TierPrice>
            </TierHeader>
            <TierFeatures>
              <li>20 Job Postings</li>
              <li>Advanced Analytics</li>
              <li>Priority Support</li>
              <li>Featured Listings</li>
              <li>API Access</li>
            </TierFeatures>
            <TierButton to="/register?plan=professional">Choose Pro</TierButton>
          </TierCard>

          <TierCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <TierHeader>
              <TierTitle>Enterprise</TierTitle>
              <TierPrice>$49.99<span>/month</span></TierPrice>
            </TierHeader>
            <TierFeatures>
              <li>Unlimited Job Postings</li>
              <li>Custom Analytics</li>
              <li>24/7 Premium Support</li>
              <li>Featured Listings</li>
              <li>API Access</li>
              <li>Custom Integration</li>
            </TierFeatures>
            <TierButton to="/register?plan=enterprise">Go Enterprise</TierButton>
          </TierCard>
        </SubscriptionTiers>
      </HeroContent>
    </HeroContainer>
  );
}
