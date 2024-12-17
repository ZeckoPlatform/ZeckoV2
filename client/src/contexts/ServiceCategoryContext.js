import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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
      const response = await api.get('/api/categories');
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
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