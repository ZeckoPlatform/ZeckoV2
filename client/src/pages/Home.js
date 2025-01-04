import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { HeroSection } from '../components/HeroSection';
import SimpleCarousel from '../components/SimpleCarousel';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Button = styled.button`
  padding: 1rem 2rem;
  margin: 0.5rem;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const HomeContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 2rem;
`;

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        console.log('Starting to fetch featured items...');
        
        // Initial test data
        const testData = {
          jobs: [
            { _id: '1', title: 'Senior Developer', description: 'Leading tech company seeking experienced developer' },
            { _id: '2', title: 'Project Manager', description: 'Managing exciting blockchain projects' },
          ],
          products: [
            { _id: '1', name: 'Premium Package', description: 'Complete business solution' },
            { _id: '2', name: 'Starter Kit', description: 'Perfect for small businesses' },
          ]
        };

        setFeaturedJobs(testData.jobs);
        setFeaturedProducts(testData.products);
        
        // Try to fetch real data
        const [jobsResponse, productsResponse] = await Promise.all([
          api.getJobs({ featured: true, limit: 5 }),
          api.getProducts({ featured: true, limit: 5 })
        ]);
        
        if (jobsResponse?.data?.jobs) setFeaturedJobs(jobsResponse.data.jobs);
        if (productsResponse?.data?.products) setFeaturedProducts(productsResponse.data.products);
        
      } catch (error) {
        console.error('Error fetching featured items:', error);
        // Keep test data if API fails
        if (!featuredJobs.length && !featuredProducts.length) {
          setError(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  const handleAccountTypeSelection = (type) => {
    navigate('/register', { state: { accountType: type } });
  };

  if (loading) {
    return (
      <HomeContainer>
        <MainContent>
          <div>Loading amazing content...</div>
        </MainContent>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <HeroSection>
        <Button onClick={() => handleAccountTypeSelection('client')}>
          Join as Client
        </Button>
        <Button onClick={() => handleAccountTypeSelection('vendor')}>
          Join as Vendor
        </Button>
      </HeroSection>
      
      <MainContent>
        <Section>
          <SectionTitle>Featured Opportunities</SectionTitle>
          {featuredJobs.length > 0 && (
            <SimpleCarousel 
              items={featuredJobs} 
              type="job"
            />
          )}
        </Section>

        <Section>
          <SectionTitle>Featured Products</SectionTitle>
          {featuredProducts.length > 0 && (
            <SimpleCarousel 
              items={featuredProducts} 
              type="product"
            />
          )}
        </Section>
      </MainContent>
    </HomeContainer>
  );
};

export default Home;
