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

function LeadPostForm() {
  // Initialize with empty arrays and loading state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    // ... other form fields
  });

  // Add getSubcategories function
  const getSubcategories = useCallback(() => {
    if (!categories || !formData.category) return [];
    
    const selectedCategory = categories.find(cat => cat.name === formData.category);
    return selectedCategory?.subcategories || [];
  }, [categories, formData.category]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset subcategory when category changes
      ...(name === 'category' ? { subcategory: '' } : {})
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <FormContainer>
      <FormGroup>
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          {categories.map(cat => (
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
            {getSubcategories().map(sub => (
              <option key={sub} value={sub}>
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

export default LeadPostForm;
