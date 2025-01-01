import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  const { categories = [], loading: categoriesLoading } = useServiceCategories() || {};
  
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    // ... other form fields
  });

  const [subcategories, setSubcategories] = useState([]);

  const validCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(cat => cat && typeof cat === 'object' && cat._id && cat.name);
  }, [categories]);

  useEffect(() => {
    if (!formData.category || !validCategories.length) {
      setSubcategories([]);
      return;
    }

    const selectedCategory = validCategories.find(cat => cat._id === formData.category);
    if (selectedCategory?.subcategories) {
      setSubcategories(selectedCategory.subcategories);
    } else {
      setSubcategories([]);
    }
  }, [formData.category, validCategories]);

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={categoriesLoading}
          required
        >
          <option value="">Select a category</option>
          {validCategories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </FormGroup>

      {formData.category && (
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
            {subcategories.map(sub => (
              <option key={`${formData.category}-${sub}`} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </FormGroup>
      )}
      {/* ... rest of the form ... */}
    </FormContainer>
  );
}

export default JobPostForm;
