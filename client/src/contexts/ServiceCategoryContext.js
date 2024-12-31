import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { jobCategories } from '../Data/leadCategories';

const ServiceCategoryContext = createContext({
  categories: [],
  loading: true,
  error: null,
  fetchCategories: () => Promise.resolve()
});

export const ServiceCategoryProvider = ({ children }) => {
  const [state, setState] = useState({
    categories: [],
    loading: true,
    error: null
  });

  const fetchCategories = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await api.get('/api/categories');
      
      if (!response?.data) {
        throw new Error('No data received from API');
      }

      // Ensure we have an array and process it safely
      const processedCategories = Array.isArray(response.data) 
        ? response.data.map(category => ({
            _id: category?._id?.toString() || '',
            name: category?.name || '',
            subcategories: Array.isArray(category?.subcategories) 
              ? [...category.subcategories] 
              : []
          }))
        : [];

      // Filter out invalid entries
      const validCategories = processedCategories.filter(cat => 
        cat._id && 
        cat.name && 
        Array.isArray(cat.subcategories)
      );

      setState({
        categories: validCategories,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch categories',
        categories: [] // Reset categories on error
      }));
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const value = useMemo(() => ({
    ...state,
    fetchCategories
  }), [state, fetchCategories]);

  return (
    <ServiceCategoryContext.Provider value={value}>
      {children}
    </ServiceCategoryContext.Provider>
  );
};

export const useServiceCategories = () => {
  const context = useContext(ServiceCategoryContext);
  
  if (!context) {
    console.warn('useServiceCategories must be used within a ServiceCategoryProvider');
    return {
      categories: [],
      loading: false,
      error: 'Context not available',
      fetchCategories: () => Promise.resolve()
    };
  }
  
  // Ensure we always return a valid object with expected properties
  return {
    categories: Array.isArray(context.categories) ? context.categories : [],
    loading: Boolean(context.loading),
    error: context.error || null,
    fetchCategories: context.fetchCategories || (() => Promise.resolve())
  };
}; 