import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { HeroSection } from '../components/HeroSection';
import SimpleCarousel from '../components/SimpleCarousel';
import api, { endpoints } from '../services/api';
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
  const [latestLeads, setLatestLeads] = useState([]);
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

  useEffect(() => {
    const fetchLatestLeads = async () => {
      try {
        const response = await api.get(endpoints.leads.list);
        setLatestLeads(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching latest leads:', error);
        setLoading(false);
      }
    };

    fetchLatestLeads();
  }, []);

  const handleAccountTypeSelection = (type) => {
    // Define the registration paths for different account types
    const registrationPaths = {
      client: '/register',
      vendor: '/register/vendor',
      business: '/register/business'
    };

    navigate(registrationPaths[type], { 
      state: { 
        accountType: type,
        accountTitle: getAccountTitle(type)
      } 
    });
  };

  const getAccountTitle = (type) => {
    switch(type) {
      case 'client':
        return 'Individual Client';
      case 'vendor':
        return 'Service Provider';
      case 'business':
        return 'Business Client';
      default:
        return 'Client';
    }
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
        <HeroContent>
          <h1>Choose Your Account Type</h1>
          <ButtonGroup>
            <AccountButton onClick={() => handleAccountTypeSelection('client')}>
              <AccountTitle>Individual Client</AccountTitle>
              <AccountDescription>
                Looking for services for personal needs
              </AccountDescription>
            </AccountButton>

            <AccountButton onClick={() => handleAccountTypeSelection('vendor')}>
              <AccountTitle>Service Provider</AccountTitle>
              <AccountDescription>
                Offer your services to clients
              </AccountDescription>
            </AccountButton>

            <AccountButton onClick={() => handleAccountTypeSelection('business')}>
              <AccountTitle>Business Client</AccountTitle>
              <AccountDescription>
                Looking for services for your business
              </AccountDescription>
            </AccountButton>
          </ButtonGroup>
        </HeroContent>
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

        <Section>
          <SectionTitle>Latest Leads</SectionTitle>
          {loading ? (
            <p>Loading latest leads...</p>
          ) : (
            <SimpleCarousel 
              items={latestLeads} 
              type="lead"
            />
          )}
        </Section>
      </MainContent>
    </HomeContainer>
  );
};

const HeroContent = styled.div`
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  h1 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 2rem;
    font-size: 2.5rem;
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const AccountButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: white;
  border: 2px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background-color: ${({ theme }) => theme.colors.primary.light};
  }
`;

const AccountTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const AccountDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.5;
`;

export default Home;
