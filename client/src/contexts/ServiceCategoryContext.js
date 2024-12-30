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
      const response = await api.get('/api/categories', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        // Ensure icons are properly mapped from the imported jobCategories
        const categoriesWithIcons = response.data.map(category => {
          const predefinedCategory = Object.values(jobCategories).find(
            c => c.name.toLowerCase() === category.name?.toLowerCase()
          );
          return {
            ...category,
            subcategories: category.subcategories || [], // Ensure subcategories is always an array
            icon: predefinedCategory?.icon || null
          };
        });
        setCategories(categoriesWithIcons);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
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
      setCategories([...categories, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to add category');
      throw err;
    }
  };

  return (
    <ServiceCategoryContext.Provider 
      value={{ 
        categories, 
        loading, 
        error, 
        fetchCategories, 
        addCategory 
      }}
    >
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