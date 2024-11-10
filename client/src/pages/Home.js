import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { JobCarousel } from '../components/JobCarousel';
import { ContractorCarousel } from '../components/ContractorCarousel';
import { FeaturedJobs } from '../components/FeaturedJobs';

const HomeContainer = styled.div`
  text-align: center;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Hero = styled.div`
  background-color: white;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const Title = styled.h1`
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 2.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: var(--text-color);
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

const FeaturedSection = styled.div`
  margin-top: 3rem;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;

  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 2rem;
  }
`;

function Home() {
  return (
    <>
      <HomeContainer>
        <Hero>
          <Title>Welcome to Our Platform</Title>
          <Subtitle>Find the perfect contractor for your project</Subtitle>
          <CTAButton to="/register">Get Started</CTAButton>
        </Hero>

        <FeaturedSection>
          <JobCarousel />
        </FeaturedSection>

        <FeaturedSection>
          <ContractorCarousel />
        </FeaturedSection>

        <FeaturedSection>
          <FeaturedJobs />
        </FeaturedSection>
      </HomeContainer>
    </>
  );
}

export default Home;
