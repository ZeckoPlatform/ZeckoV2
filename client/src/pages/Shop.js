import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { productService } from '../services/productService';

const ShopContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: white;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductInfo = styled.div`
  margin-top: 10px;
`;

const ProductTitle = styled.h3`
  margin: 0;
  color: var(--primary-color);
`;

const ProductPrice = styled.p`
  font-weight: bold;
  color: #333;
`;

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    price: '',
    sort: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts(filters);
      console.log('API Response:', response); // Debug log
      
      // Handle different possible response formats
      const productsData = response?.products || response || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Error fetching products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getFilteredProducts = () => {
    if (!Array.isArray(products)) return [];
    
    return products
      .filter(product => {
        if (!filters.category) return true;
        return product?.category === filters.category;
      })
      .filter(product => {
        if (!filters.price) return true;
        const [min, max] = filters.price.split('-').map(Number);
        return product?.price >= min && product?.price <= max;
      })
      .sort((a, b) => {
        switch (filters.sort) {
          case 'price-low':
            return (a?.price || 0) - (b?.price || 0);
          case 'price-high':
            return (b?.price || 0) - (a?.price || 0);
          case 'newest':
            return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
          default:
            return 0;
        }
      });
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error} <button onClick={fetchProducts}>Retry</button></div>;

  const filteredProducts = getFilteredProducts();

  return (
    <ShopContainer>
      <h1>Shop</h1>
      <FiltersContainer>
        <Select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
        >
          <option value="">All Categories</option>
          <option value="tools">Tools</option>
          <option value="materials">Materials</option>
          <option value="equipment">Equipment</option>
        </Select>

        <Select
          name="price"
          value={filters.price}
          onChange={handleFilterChange}
        >
          <option value="">All Prices</option>
          <option value="0-50">$0 - $50</option>
          <option value="51-100">$51 - $100</option>
          <option value="101-500">$101 - $500</option>
          <option value="501-1000">$501 - $1000</option>
        </Select>

        <Select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </Select>
      </FiltersContainer>

      {!filteredProducts || filteredProducts.length === 0 ? (
        <div>No products found matching your criteria.</div>
      ) : (
        <ProductGrid>
          {filteredProducts.map((product) => (
            <ProductCard key={product?._id || Math.random()}>
              <ProductImage 
                src={product?.image || 'placeholder-image-url'} 
                alt={product?.name || 'Product'} 
                onError={(e) => {
                  e.target.src = 'placeholder-image-url';
                }}
              />
              <ProductInfo>
                <ProductTitle>{product?.name || 'Unnamed Product'}</ProductTitle>
                <ProductPrice>${product?.price || 'N/A'}</ProductPrice>
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductGrid>
      )}
    </ShopContainer>
  );
}

export default Shop;
