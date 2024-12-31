import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { jobCategories } from '../Data/leadCategories';

const ServiceCategoryContext = createContext(null);

export const ServiceCategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);  // Initialize with empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/categories');
      
      if (!response?.data) {
        setCategories([]);
        return;
      }

      const processedCategories = (Array.isArray(response.data) ? response.data : [])
        .map(category => ({
          _id: category?._id?.toString() || '',
          name: category?.name || '',
          subcategories: Array.isArray(category?.subcategories) ? category.subcategories : []
        }))
        .filter(cat => cat._id && cat.name);

      setCategories(processedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
      setCategories([]);  // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const value = {
    categories: categories || [],
    loading,
    error,
    fetchCategories
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
    return {
      categories: [],
      loading: false,
      error: null,
      fetchCategories: () => Promise.resolve()
    };
  }
  
  return context;
}; 