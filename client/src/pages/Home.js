import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SimpleCarousel from '../components/SimpleCarousel';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

const Home = () => {
  const { theme } = useTheme();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const [jobsResponse, productsResponse] = await Promise.all([
          api.getJobs({ featured: true, limit: 5 }),
          api.getProducts({ featured: true, limit: 5 })
        ]);
        
        setFeaturedJobs(jobsResponse.data.jobs);
        setFeaturedProducts(productsResponse.data.products);
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <HomeContainer>
      <HeroSection>
        <HeroContent>
          <h1>Find Your Next Opportunity</h1>
          <p>Discover and apply to jobs that match your skills and aspirations</p>
          <CallToAction to="/jobs">Browse Jobs</CallToAction>
        </HeroContent>
      </HeroSection>

      <Section>
        <SectionTitle>Featured Jobs</SectionTitle>
        <SimpleCarousel items={featuredJobs} type="job" />
      </Section>

      <Section>
        <SectionTitle>Featured Products</SectionTitle>
        <SimpleCarousel items={featuredProducts} type="product" />
      </Section>
    </HomeContainer>
  );
};

// Styled Components
const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.section`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 4rem 2rem;
  border-radius: 8px;
  margin-bottom: 3rem;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
`;

const CallToAction = styled(Link)`
  display: inline-block;
  padding: 1rem 2rem;
  background: white;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.text};
`;

export default Home;
