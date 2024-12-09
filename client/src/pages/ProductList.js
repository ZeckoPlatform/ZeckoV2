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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productsAPI.getAll();
        setProducts(response.data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const addToCart = async (productId) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });
      if (response.ok) {
        console.log('Added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div>
      <h1>Products</h1>
      <SearchBar onSearch={handleSearch} />
      <ProductGrid>
        {products.map(product => (
          <ProductCard key={product._id}>
            <Link to={`/products/${product._id}`}>
              <ProductImage src={product.image} alt={product.name} />
              <ProductName>{product.name}</ProductName>
              <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
            </Link>
            <AddToCartButton onClick={() => addToCart(product._id)}>
              Add to Cart
            </AddToCartButton>
          </ProductCard>
        ))}
      </ProductGrid>
      <PaginationContainer>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <PageButton
            key={page}
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </PageButton>
        ))}
      </PaginationContainer>
    </div>
  );
};

export default ProductList;
