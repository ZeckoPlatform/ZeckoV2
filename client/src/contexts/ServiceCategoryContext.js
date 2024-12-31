import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { jobCategories } from '../Data/leadCategories';

const ServiceCategoryContext = createContext();

export const ServiceCategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/categories', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      // Enhanced data validation
      if (!response?.data) {
        setCategories([]);
        throw new Error('No data received from server');
      }

      // Ensure categories is always an array with proper structure
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      
      const processedCategories = categoriesData.map(category => ({
        ...category,
        _id: category?._id || '',
        name: category?.name || '',
        icon: category?.icon || 'default-icon',
        subcategories: Array.isArray(category?.subcategories) 
          ? category.subcategories.filter(sub => sub) // Filter out null/undefined
          : []
      }));

      setCategories(processedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
      setCategories([]); // Ensure categories is always an array
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (categoryData) => {
    try {
      const response = await api.post('/api/categories', categoryData);
      if (response?.data) {
        setCategories(prevCategories => [...(prevCategories || []), response.data]);
        return response.data;
      }
      throw new Error('Invalid response data');
    } catch (err) {
      setError('Failed to add category');
      throw err;
    }
  };

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
    throw new Error('useServiceCategories must be used within a ServiceCategoryProvider');
  }
  return context;
}; 