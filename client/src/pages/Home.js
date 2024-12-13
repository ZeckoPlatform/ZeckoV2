import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useProducts } from '../contexts/ProductContext';
import SimpleCarousel from '../components/SimpleCarousel';
import { HeroSection } from '../components/HeroSection';

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

  const featuredProducts = [
    {
      _id: 'product1',
      name: 'Featured Product 1',
      description: 'High-quality product with amazing features',
    },
    {
      _id: 'product2',
      name: 'Featured Product 2',
      description: 'Premium product for your needs',
    },
    {
      _id: 'product3',
      name: 'Featured Product 3',
      description: 'Best-selling product in our catalog',
    }
  ];

  return (
    <>
      <HeroSection />
      <Container>
        <Section>
          <SectionTitle>Featured Services</SectionTitle>
          <SimpleCarousel items={featuredServices} type="service" />
        </Section>

        <Section>
          <SectionTitle>Featured Products</SectionTitle>
          <SimpleCarousel items={featuredProducts} type="product" />
        </Section>

        <Section>
          <SectionTitle>Latest Products</SectionTitle>
          {loading ? (
            <LoadingState>Loading...</LoadingState>
          ) : error ? (
            <ErrorState>{error}</ErrorState>
          ) : (
            <ProductsGrid>
              {products.length === 0 ? (
                <EmptyState>No products available.</EmptyState>
              ) : (
                products.map(product => (
                  <ProductCard key={product._id}>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <span>${product.price}</span>
                  </ProductCard>
                ))
              )}
            </ProductsGrid>
          )}
        </Section>
      </Container>
    </>
  );
};

const Container = styled.div`
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
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`;

const ProductCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }

  h3 {
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 1rem;
  }

  span {
    color: ${({ theme }) => theme.colors.primary.main};
    font-weight: bold;
  }
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

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  grid-column: 1 / -1;
`;

export default Home;
