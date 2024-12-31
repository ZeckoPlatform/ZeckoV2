import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { jobCategories } from '../Data/leadCategories';

const ServiceCategoryContext = createContext({
  categories: [],
  loading: false,
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
        throw new Error('No data received from server');
      }

      const processedCategories = (Array.isArray(response.data) ? response.data : [])
        .map(category => ({
          _id: category?._id?.toString() || '',
          name: category?.name || '',
          subcategories: Array.isArray(category?.subcategories) ? category.subcategories : []
        }))
        .filter(cat => cat._id && cat.name);

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
        categories: [] // Reset to empty array on error
      }));
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        await fetchCategories();
      } catch (error) {
        if (mounted) {
          console.error('Failed to load categories:', error);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
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