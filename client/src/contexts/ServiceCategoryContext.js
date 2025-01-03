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
      
      // If API fails or returns empty data, use local jobCategories
      if (!response?.data || response.data.length === 0) {
        const localCategories = Object.entries(jobCategories).map(([id, category]) => ({
          _id: id.toLowerCase().replace(/\s+/g, '-'),
          name: category.name,
          description: category.description,
          subcategories: category.subcategories || [],
          icon: category.icon
        }));
        
        setState(prev => ({
          ...prev,
          categories: localCategories,
          loading: false
        }));
        return;
      }

      // Process API response if successful
      const processedCategories = Array.isArray(response.data) 
        ? response.data.map(category => ({
            _id: category?._id?.toString() || '',
            name: category?.name || '',
            description: category?.description || '',
            subcategories: Array.isArray(category?.subcategories) 
              ? category.subcategories 
              : jobCategories[category?.name]?.subcategories || [],
            icon: category?.icon || jobCategories[category?.name]?.icon
          }))
        : [];

      setState(prev => ({
        ...prev,
        categories: processedCategories,
        loading: false
      }));
    } catch (err) {
      console.error('Error fetching categories:', err);
      
      // Fallback to local data on error
      const localCategories = Object.entries(jobCategories).map(([id, category]) => ({
        _id: id.toLowerCase().replace(/\s+/g, '-'),
        name: category.name,
        description: category.description,
        subcategories: category.subcategories || [],
        icon: category.icon
      }));
      
      setState(prev => ({
        ...prev,
        categories: localCategories,
        loading: false,
        error: null // We're not showing error since we have fallback data
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