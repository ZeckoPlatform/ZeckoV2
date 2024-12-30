import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jobCategories } from '../Data/leadCategories'; // Import the predefined categories

const ServiceCategoryContext = createContext();

export const ServiceCategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // First try to fetch from API
      const response = await api.get('/api/categories');
      if (response.data && response.data.length > 0) {
        setCategories(response.data);
      } else {
        // If no categories from API, use predefined categories
        const formattedCategories = Object.values(jobCategories).map(category => ({
          _id: category.name.toLowerCase().replace(/\s+/g, '-'),
          name: category.name,
          description: category.description,
          icon: category.icon,
          subcategories: category.subcategories
        }));
        setCategories(formattedCategories);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback to predefined categories on error
      const formattedCategories = Object.values(jobCategories).map(category => ({
        _id: category.name.toLowerCase().replace(/\s+/g, '-'),
        name: category.name,
        description: category.description,
        icon: category.icon,
        subcategories: category.subcategories
      }));
      setCategories(formattedCategories);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

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