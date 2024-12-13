import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SimpleCarousel from '../components/SimpleCarousel';
import { productsAPI } from '../services/api';
import { CircularProgress } from '@mui/material';

const HomeContainer = styled.div`
  text-align: center;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Hero = styled.section`
  background: ${({ theme }) => theme.colors.primary.gradient};
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.lg}`};
  text-align: center;
  color: ${({ theme }) => theme.colors.primary.text};
  animation: ${fadeIn} ${({ theme }) => theme.transitions.long} ease-in;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: ${slideUp} ${({ theme }) => theme.transitions.long} ease-out;
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2vw, 1.25rem);
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.text};
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-decoration: none;
  font-weight: bold;
  transition: background-color ${({ theme }) => theme.transitions.short};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const FeaturedSection = styled.section`
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.background.main};
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.size.h2};
`;

function Home() {
  const [data, setData] = useState({
    contractors: [],
    jobs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        
        // Simulate different data for contractors and jobs
        const items = Array.isArray(response?.data) ? response.data : [];
        setData({
          contractors: items.slice(0, 5),  // First 5 items as contractors
          jobs: items.slice(5, 10)         // Next 5 items as jobs
        });
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div>Error loading content: {error}</div>;
  }

  return (
    <HomeContainer>
      <Hero>
        <HeroTitle>Welcome to Our Platform</HeroTitle>
        <HeroSubtitle>Find the perfect contractor for your project</HeroSubtitle>
        <CTAButton to="/register">Get Started</CTAButton>
      </Hero>

      <FeaturedSection>
        <SectionTitle>Featured Contractors</SectionTitle>
        <SimpleCarousel 
          items={data.contractors} 
          type="contractor" 
        />
      </FeaturedSection>

      <FeaturedSection>
        <SectionTitle>Featured Jobs</SectionTitle>
        <SimpleCarousel 
          items={data.jobs} 
          type="job" 
        />
      </FeaturedSection>
    </HomeContainer>
  );
}

export default Home;
