import React from 'react';
import styled from 'styled-components';
import { useProducts } from '../contexts/ProductContext';

const Shop = () => {
  const { products, loading, error } = useProducts();

  if (loading) return <LoadingState>Loading...</LoadingState>;
  if (error) return <ErrorState>{error}</ErrorState>;

  return (
    <Container>
      <Title>Shop</Title>
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
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
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
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.error.main};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  grid-column: 1 / -1;
`;

export default Shop;
