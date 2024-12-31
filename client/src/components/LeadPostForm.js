import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import Spinner from './Spinner';
import { useServiceCategories } from '../contexts/ServiceCategoryContext';

const FormContainer = styled.form`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: 2px solid var(--primary-color);
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
  font-size: 16px;

  &:focus {
    outline: 2px solid var(--primary-color);
    border-color: var(--primary-color);
  }
`;

const SubmitButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  
  &:hover, &:focus {
    background-color: darken(var(--primary-color), 10%);
    outline: 2px solid var(--primary-color);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: var(--error-color);
  margin-bottom: 10px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: 2px solid var(--primary-color);
    border-color: var(--primary-color);
  }
`;

function JobPostForm({ onJobPosted }) {
  // Initialize state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    selectedCategory: '',
    subcategory: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get categories with fallback values
  const categoriesContext = useServiceCategories();
  const {
    categories = [],
    loading: categoriesLoading = false,
    error: categoriesError = null
  } = categoriesContext || {};

  // Ensure categories is always an array
  const validCategories = useMemo(() => {
    if (!Array.isArray(categories)) {
      console.warn('Categories is not an array:', categories);
      return [];
    }
    return categories;
  }, [categories]);

  // Get current category and subcategories safely
  const currentCategory = useMemo(() => {
    if (!formData.selectedCategory) return null;
    return validCategories.find(cat => cat?._id === formData.selectedCategory);
  }, [validCategories, formData.selectedCategory]);

  const subcategories = useMemo(() => {
    if (!currentCategory?.subcategories) return [];
    return Array.isArray(currentCategory.subcategories) 
      ? currentCategory.subcategories 
      : [];
  }, [currentCategory]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      selectedCategory: value,
      subcategory: '' // Reset subcategory when category changes
    }));
  };

  // Show loading state
  if (categoriesLoading) {
    return (
      <FormContainer>
        <Spinner />
      </FormContainer>
    );
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <FormGroup>
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </FormGroup>

      {/* Other form fields... */}

      <FormGroup>
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          name="category"
          value={formData.selectedCategory}
          onChange={handleCategoryChange}
          required
          disabled={categoriesLoading}
        >
          <option value="">Select a category</option>
          {validCategories && validCategories.length > 0 ? (
            validCategories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name || 'Unnamed Category'}
              </option>
            ))
          ) : (
            <option value="" disabled>No categories available</option>
          )}
        </Select>
      </FormGroup>

      {subcategories.length > 0 && (
        <FormGroup>
          <Label htmlFor="subcategory">Subcategory</Label>
          <Select
            id="subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            required
          >
            <option value="">Select a subcategory</option>
            {subcategories.map((sub, index) => (
              <option key={`${sub}-${index}`} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </FormGroup>
      )}

      <SubmitButton 
        type="submit" 
        disabled={loading || categoriesLoading}
      >
        {loading ? <Spinner /> : 'Post Job'}
      </SubmitButton>
    </FormContainer>
  );
}

export default JobPostForm;
