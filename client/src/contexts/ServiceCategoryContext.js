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
      console.log('API Response:', response); // Debug log

      if (!response?.data) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'No data received',
          categories: []
        }));
        return;
      }

      const processedCategories = (Array.isArray(response.data) ? response.data : [])
        .map(category => ({
          _id: category?._id?.toString() || '',
          name: category?.name || '',
          subcategories: Array.isArray(category?.subcategories) ? category.subcategories : []
        }))
        .filter(cat => cat._id && cat.name);

      console.log('Processed Categories:', processedCategories); // Debug log

      setState({
        categories: processedCategories,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch categories',
        categories: []
      }));
    }
  }, []);

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
  
  return context;
}; 