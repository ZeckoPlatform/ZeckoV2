import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SimpleCarousel from '../components/SimpleCarousel';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

const Home = () => {
  const { theme } = useTheme();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await api.getJobs({ featured: true, limit: 5 });
        setFeaturedJobs(response.data.jobs);
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
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
        <SectionTitle>Why Choose Us</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <h3>Quality Listings</h3>
            <p>Curated job postings from verified employers</p>
          </FeatureCard>
          <FeatureCard>
            <h3>Easy Apply</h3>
            <p>Simple and quick application process</p>
          </FeatureCard>
          <FeatureCard>
            <h3>Career Growth</h3>
            <p>Opportunities for professional development</p>
          </FeatureCard>
        </FeaturesGrid>
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

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

const FeatureCard = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  
  h3 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: 1rem;
  }
  
  p {
    color: ${props => props.theme.colors.text};
  }
`;

export default Home;
