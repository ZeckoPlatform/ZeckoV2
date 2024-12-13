import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useProducts } from '../contexts/ProductContext';
import SimpleCarousel from '../components/SimpleCarousel';

const Home = () => {
  const { products, loading, error, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const featuredServices = [
    {
      _id: 'service1',
      title: 'Professional Services',
      description: 'Expert solutions for your needs',
    },
    {
      _id: 'service2',
      title: 'Business Solutions',
      description: 'Grow your business with us',
    },
    {
      _id: 'service3',
      title: 'Technical Support',
      description: '24/7 dedicated assistance',
    }
  ];

  return (
    <Container>
      <HeroSection>
        <h1>Welcome to Our Platform</h1>
        <p>Find the best services and connect with professionals</p>
      </HeroSection>

      <Section>
        <SectionTitle>Featured Services</SectionTitle>
        <SimpleCarousel items={featuredServices} type="service" />
      </Section>

      <Section>
        <SectionTitle>Latest Products</SectionTitle>
        {loading ? (
          <LoadingState>Loading...</LoadingState>
        ) : error ? (
          <ErrorState>{error}</ErrorState>
        ) : (
          <SimpleCarousel items={products} type="product" />
        )}
      </Section>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 3rem 1rem;
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 8px;
  margin-bottom: 3rem;

  h1 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 1rem;
    font-size: 2.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 1.2rem;
  }
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.error.main};
`;

export default Home;
