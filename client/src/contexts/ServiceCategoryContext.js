import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { jobCategories } from '../Data/leadCategories';

const ServiceCategoryContext = createContext({
  // Provide default values
  categories: [],
  loading: true,
  error: null,
  fetchCategories: () => Promise.resolve(),
  addCategory: () => Promise.resolve()
});

export const ServiceCategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(() => {
    // Initialize with default categories if available
    try {
      return Array.isArray(jobCategories) ? jobCategories : [];
    } catch (e) {
      return [];
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!navigator.onLine) {
      setError('No internet connection');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/categories');
      
      // Validate response
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format');
      }

      // Safely access data with fallback
      const data = response?.data || [];
      
      // Ensure we have an array
      const categoriesData = Array.isArray(data) ? data : [];
      
      // Process categories with strict validation
      const processedCategories = categoriesData
        .filter(category => category && typeof category === 'object')
        .map(category => ({
          _id: category._id?.toString() || '',
          name: String(category.name || ''),
          icon: String(category.icon || 'default-icon'),
          subcategories: Array.isArray(category.subcategories)
            ? category.subcategories
                .filter(Boolean)
                .map(sub => String(sub))
            : []
        }));

      setCategories(processedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
      // Keep existing categories if available, otherwise use empty array
      setCategories(prev => prev.length ? prev : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeCategories = async () => {
      try {
        await fetchCategories();
      } catch (err) {
        console.error('Failed to initialize categories:', err);
      }
    };

    initializeCategories();

    return () => {
      mounted = false;
    };
  }, [fetchCategories]);

  const addCategory = useCallback(async (categoryData) => {
    try {
      const response = await api.post('/api/categories', categoryData);
      
      if (!response?.data) {
        throw new Error('No data received from server');
      }

      setCategories(prevCategories => {
        const newCategories = Array.isArray(prevCategories) ? [...prevCategories] : [];
        return [...newCategories, response.data];
      });

      return response.data;
    } catch (err) {
      setError('Failed to add category');
      throw err;
    }
  }, []);

  const value = {
    categories: categories || [],
    loading,
    error,
    fetchCategories,
    addCategory
  };

  return (
    <ServiceCategoryContext.Provider value={value}>
      {children}
    </ServiceCategoryContext.Provider>
  );
};

export const useServiceCategories = () => {
  const context = useContext(ServiceCategoryContext);
  
  if (!context) {
    console.error('ServiceCategoryContext not found - check provider wrapping');
    return {
      categories: [],
      loading: false,
      error: 'Context not available',
      fetchCategories: () => Promise.resolve(),
      addCategory: () => Promise.resolve()
    };
  }
  
  return {
    ...context,
    categories: Array.isArray(context.categories) ? context.categories : []
  };
}; 