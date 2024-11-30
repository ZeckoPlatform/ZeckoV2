import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { JobCarousel } from '../components/JobCarousel';
import { ContractorCarousel } from '../components/ContractorCarousel';
import { FeaturedJobs } from '../components/FeaturedJobs';
import { fadeIn, slideUp } from '../styles/animations';
import { fetchData, endpoints } from '../services/api';
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`;

function Home() {
  const [featuredData, setFeaturedData] = useState({
    products: [],
    jobs: [],
    contractors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedData = async () => {
      try {
        const [products, jobs, contractors] = await Promise.all([
          fetchData(endpoints.products.featured),
          fetchData(endpoints.jobs.featured),
          fetchData(endpoints.contractors.featured)
        ]);

        setFeaturedData({
          products: products.data || [],
          jobs: jobs.data || [],
          contractors: contractors.data || []
        });
      } catch (error) {
        console.error('Error loading featured data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <HomeContainer>
        <Hero>
          <HeroTitle>Welcome to Our Platform</HeroTitle>
          <HeroSubtitle>Find the perfect contractor for your project</HeroSubtitle>
          <CTAButton to="/register">Get Started</CTAButton>
        </Hero>

        <FeaturedSection>
          <SectionTitle>Featured Jobs</SectionTitle>
          <Grid>
            <JobCarousel />
          </Grid>
        </FeaturedSection>

        <FeaturedSection>
          <SectionTitle>Featured Contractors</SectionTitle>
          <Grid>
            <ContractorCarousel />
          </Grid>
        </FeaturedSection>

        <FeaturedSection>
          <SectionTitle>Featured Jobs</SectionTitle>
          <Grid>
            <FeaturedJobs />
          </Grid>
        </FeaturedSection>
      </HomeContainer>
    </>
  );
}

export default Home;
