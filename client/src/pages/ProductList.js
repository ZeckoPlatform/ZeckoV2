import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import SearchBar from '../components/SearchBar';
import { productsAPI, cartAPI } from '../services/api';
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
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const addToCart = async (productId) => {
    if (!productId) return;
    try {
      await cartAPI.addToCart(productId);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await productsAPI.getAll({
          page: currentPage,
          search: searchQuery
        });

        if (!mounted) return;

        // Ensure we have a valid array of products
        const productData = response?.data || [];
        setProducts(Array.isArray(productData) ? productData : []);
        
      } catch (error) {
        if (!mounted) return;
        console.error('Error loading products:', error);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [currentPage, searchQuery]);

  if (loading) {
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

  if (error) {
    return (
      <div>
        <h1>Products</h1>
        <SearchBar onSearch={handleSearch} />
        <div>{error}</div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div>
        <h1>Products</h1>
        <SearchBar onSearch={handleSearch} />
        <div>No products found</div>
      </div>
    );
  }

  return (
    <div>
      <h1>Products</h1>
      <SearchBar onSearch={handleSearch} />
      <ProductGrid>
        {products.map(product => {
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
              <AddToCartButton 
                onClick={() => addToCart(id)}
                disabled={!id}
              >
                Add to Cart
              </AddToCartButton>
            </ProductCard>
          );
        })}
      </ProductGrid>
    </div>
  );
};

export default ProductList;
