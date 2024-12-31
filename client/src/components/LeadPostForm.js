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
  // Initialize state with empty values
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    subcategory: ''
  });

  // Get categories with proper default values
  const {
    categories = [],
    loading: categoriesLoading,
    error: categoriesError
  } = useServiceCategories() || {};

  // Ensure categories is always an array
  const validCategories = useMemo(() => {
    return Array.isArray(categories) ? categories : [];
  }, [categories]);

  // Get subcategories based on selected category
  const subcategories = useMemo(() => {
    const selectedCategory = validCategories.find(cat => cat._id === formData.category);
    return selectedCategory?.subcategories || [];
  }, [validCategories, formData.category]);

  return (
    <FormContainer onSubmit={handleSubmit}>
      {categoriesLoading && <Spinner />}
      {categoriesError && <ErrorMessage>{categoriesError}</ErrorMessage>}
      
      <FormGroup>
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          disabled={categoriesLoading}
        >
          <option value="">Select a category</option>
          {validCategories.length > 0 && validCategories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
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
              <option key={`${formData.category}-${index}`} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </FormGroup>
      )}

      {/* Rest of your form */}
    </FormContainer>
  );
}

export default JobPostForm;
