import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching products with params:', params);

      // Only make the API call if we're on a page that needs products
      if (window.location.pathname === '/' || window.location.pathname === '/products') {
        const response = await api.get('/products', { params });
        console.log('Products response:', response.data);
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Provide methods to filter and sort products
  const filterProducts = useCallback((filters) => {
    fetchProducts({ ...filters });
  }, [fetchProducts]);

  const value = {
    products,
    loading,
    error,
    fetchProducts,
    filterProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}; 