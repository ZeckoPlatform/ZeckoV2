import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { HeroSection } from '../components/HeroSection';
import SimpleCarousel from '../components/SimpleCarousel';
import api from '../services/api';

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const [jobsResponse, productsResponse] = await Promise.all([
          api.getJobs({ featured: true, limit: 5 }),
          api.getProducts({ featured: true, limit: 5 })
        ]);
        
        setFeaturedJobs(jobsResponse.data.jobs || []);
        setFeaturedProducts(productsResponse.data.products || []);
      } catch (error) {
        console.error('Error fetching featured items:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <>
      <HeroSection />
      <MainContent>
        <Section>
          <SectionTitle>Featured Jobs</SectionTitle>
          <SimpleCarousel items={featuredJobs} type="job" />
        </Section>

        <Section>
          <SectionTitle>Featured Products</SectionTitle>
          <SimpleCarousel items={featuredProducts} type="product" />
        </Section>
      </MainContent>
    </>
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
