import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import SearchBar from '../components/SearchBar';
import { productsAPI } from '../services/api';
import { CircularProgress } from '@mui/material';

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
`;

const LoadingMessage = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const AddToCartButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.text};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.size.md};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const PageButton = styled.button`
  margin: 0 ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ active, theme }) => 
    active ? theme.colors.primary.main : theme.colors.background.paper};
  color: ${({ active, theme }) => 
    active ? theme.colors.primary.text : theme.colors.text.primary};
  border: none;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const ProductImage = styled.img`
  max-width: 100%;
  height: auto;
`;

const ProductName = styled.h3`
  margin-bottom: 10px;
`;

const ProductPrice = styled.p`
  margin-bottom: 20px;
`;

const ProductList = () => {
  const [state, setState] = useState({
    products: [],
    loading: true,
    error: null,
    searchQuery: '',
    currentPage: 1
  });

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      if (!mounted) return;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await productsAPI.getAll({
          page: state.currentPage,
          search: state.searchQuery
        });

        if (!mounted) return;

        const productData = response?.data || [];
        
        setState(prev => ({
          ...prev,
          products: Array.isArray(productData) ? productData : [],
          loading: false
        }));

      } catch (error) {
        if (!mounted) return;
        console.error('Error loading products:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to load products',
          loading: false,
          products: []
        }));
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [state.currentPage, state.searchQuery]);

  const handleSearch = (query) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      currentPage: 1
    }));
  };

  if (state.loading) {
    return (
      <div>
        <h1>Products</h1>
        <SearchBar onSearch={handleSearch} />
        <LoadingMessage>
          <CircularProgress />
        </LoadingMessage>
      </div>
    );
  }

  if (state.error) {
    return (
      <div>
        <h1>Products</h1>
        <SearchBar onSearch={handleSearch} />
        <div>{state.error}</div>
      </div>
    );
  }

  const safeProducts = Array.isArray(state.products) ? state.products : [];

  return (
    <div>
      <h1>Products</h1>
      <SearchBar onSearch={handleSearch} />
      {safeProducts.length > 0 ? (
        <ProductGrid>
          {safeProducts.map(product => {
            if (!product) return null;
            const id = product._id || product.id;
            if (!id) return null;

            return (
              <ProductCard key={id}>
                <Link to={`/products/${id}`}>
                  <ProductImage 
                    src={product.image || '/placeholder.png'} 
                    alt={product.name || 'Product'} 
                  />
                  <ProductName>
                    {product.name || 'Unnamed Product'}
                  </ProductName>
                  <ProductPrice>
                    ${(product.price || 0).toFixed(2)}
                  </ProductPrice>
                </Link>
              </ProductCard>
            );
          })}
        </ProductGrid>
      ) : (
        <div>No products found</div>
      )}
    </div>
  );
};

export default React.memo(ProductList);
