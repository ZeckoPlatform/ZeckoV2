import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useProducts } from '../contexts/ProductContext';

const Home = () => {
  const { products, loading, error, fetchProducts } = useProducts();

  useEffect(() => {
    // Only fetch products when component mounts
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (error) {
    return <Container>Error: {error}</Container>;
  }

  return (
    <Container>
      <Header>
        <h1>Welcome to Our Platform</h1>
      </Header>
      
      <ProductsSection>
        <h2>Latest Products</h2>
        {products.length > 0 ? (
          <ProductGrid>
            {products.map(product => (
              <ProductCard key={product._id}>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <p>Price: ${product.price}</p>
              </ProductCard>
            ))}
          </ProductGrid>
        ) : (
          <EmptyState>No products available</EmptyState>
        )}
      </ProductsSection>
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ProductsSection = styled.section`
  margin-top: 2rem;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export default Home;
