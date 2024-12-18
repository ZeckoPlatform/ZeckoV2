import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { HeroSection } from '../components/HeroSection';
import SimpleCarousel from '../components/SimpleCarousel';
import api from '../services/api';

const Home = () => {
  console.log('Home component mounted');

  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        console.log('Starting to fetch featured items...');
        
        const testData = {
          jobs: [
            { _id: '1', title: 'Test Job 1', description: 'Test Description 1' },
            { _id: '2', title: 'Test Job 2', description: 'Test Description 2' },
          ],
          products: [
            { _id: '1', name: 'Test Product 1', description: 'Test Description 1' },
            { _id: '2', name: 'Test Product 2', description: 'Test Description 2' },
          ]
        };

        setFeaturedJobs(testData.jobs);
        setFeaturedProducts(testData.products);
        setLoading(false);

        const [jobsResponse, productsResponse] = await Promise.all([
          api.getJobs({ featured: true, limit: 5 }),
          api.getProducts({ featured: true, limit: 5 })
        ]);
        
        console.log('API Responses:', {
          jobs: jobsResponse?.data,
          products: productsResponse?.data
        });
        
        if (jobsResponse?.data?.jobs) setFeaturedJobs(jobsResponse.data.jobs);
        if (productsResponse?.data?.products) setFeaturedProducts(productsResponse.data.products);
        
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          stack: error.stack
        });
        if (!featuredJobs.length && !featuredProducts.length) {
          setError(error);
        }
      }
    };

    fetchFeaturedItems();
  }, []);

  console.log('Rendering with:', {
    loading,
    error: error?.message,
    jobsCount: featuredJobs.length,
    productsCount: featuredProducts.length
  });

  if (loading) {
    return <div style={{padding: '20px', background: '#f0f0f0'}}>Loading featured items...</div>;
  }

  if (error && !featuredJobs.length && !featuredProducts.length) {
    return <div style={{padding: '20px', color: 'red'}}>Error loading content: {error.message}</div>;
  }

  return (
    <div style={{position: 'relative'}}>
      <div style={{
        position: 'fixed',
        top: '60px',
        left: '0',
        padding: '10px',
        background: '#f0f0f0',
        zIndex: 1000,
        border: '1px solid #ccc'
      }}>
        Debug: Jobs: {featuredJobs.length}, Products: {featuredProducts.length}
      </div>
      
      <HeroSection />
      
      <MainContent>
        <Section>
          <SectionTitle>Featured Jobs ({featuredJobs.length})</SectionTitle>
          <SimpleCarousel items={featuredJobs} type="job" />
        </Section>

        <Section>
          <SectionTitle>Featured Products ({featuredProducts.length})</SectionTitle>
          <SimpleCarousel items={featuredProducts} type="product" />
        </Section>
      </MainContent>
    </div>
  );
};

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
  color: ${props => props.theme.colors.text};
`;

export default Home;
