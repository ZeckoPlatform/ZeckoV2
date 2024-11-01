import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeroContainer = styled.section`
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7));
  color: white;
  padding: 100px 20px;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 3em;
  margin-bottom: 20px;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2em;
  margin-bottom: 30px;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 15px 30px;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--primary-dark);
  }
`;

export function HeroSection() {
  return (
    <HeroContainer>
      <HeroContent>
        <HeroTitle>Find Your Perfect Contractor</HeroTitle>
        <HeroSubtitle>
          Connect with skilled professionals for your next project
        </HeroSubtitle>
        <CTAButton to="/search">Get Started</CTAButton>
      </HeroContent>
    </HeroContainer>
  );
}
