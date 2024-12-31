import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jobCategories } from '../Data/leadCategories';

const ServiceCategoryContext = createContext();

export const ServiceCategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/categories', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      // Ensure we have valid data before processing
      if (response?.data && Array.isArray(response.data)) {
        const categoriesWithIcons = response.data.map(category => {
          const predefinedCategory = category?.name 
            ? Object.values(jobCategories).find(
                c => c.name.toLowerCase() === category.name.toLowerCase()
              )
            : null;
          
          return {
            ...category,
            _id: category._id || category.name?.toLowerCase().replace(/\s+/g, '-'),
            name: category.name || '',
            subcategories: category.subcategories || [],
            icon: predefinedCategory?.icon || null
          };
        });
        setCategories(categoriesWithIcons);
      } else {
        console.warn('Invalid categories data received');
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
      setCategories([]); // Ensure categories is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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