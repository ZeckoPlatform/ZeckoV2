import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { jobCategories } from '../data/leadCategories';

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
      console.log('API Response categories:', response?.data); // Debug log
      
      // If API fails or returns empty data, use local jobCategories
      if (!response?.data || response.data.length === 0) {
        console.warn('No categories from API, using local data');
        const localCategories = Object.entries(jobCategories).map(([id, category]) => {
          console.log(`Processing local category: ${category.name}`); // Debug log
          return {
            _id: id.toLowerCase().replace(/[&\s]+/g, '-'), // Format ID to match MongoDB
            name: category.name,
            description: category.description,
            subcategories: category.subcategories || [],
            icon: category.icon
          };
        });
        
        setState(prev => ({
          ...prev,
          categories: localCategories,
          loading: false
        }));
        return;
      }

      // Process API response if successful
      const processedCategories = response.data.map(category => {
        console.log(`Processing API category: ${category.name}, ID: ${category._id}`); // Debug log
        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          subcategories: category.subcategories || [],
          icon: category.icon
        };
      });

      setState(prev => ({
        ...prev,
        categories: processedCategories,
        loading: false
      }));
    } catch (err) {
      console.error('Error fetching categories:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message
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