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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    subcategory: ''
  });

  // Fetch categories once on component mount
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data || []);
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Get subcategories for selected category
  const subcategories = useMemo(() => {
    const category = categories.find(cat => cat.name === selectedCategory);
    return category?.subcategories || [];
  }, [categories, selectedCategory]);

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">Select Category</option>
        {Array.isArray(categories) && categories.map(cat => (
          <option key={cat._id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={formData.subcategory}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          subcategory: e.target.value
        }))}
        disabled={!selectedCategory}
      >
        <option value="">Select Subcategory</option>
        {Array.isArray(subcategories) && subcategories.map(sub => (
          <option key={sub._id} value={sub.name}>
            {sub.name}
          </option>
        ))}
      </select>

      {/* Rest of your form fields */}
    </form>
  );
}

export default LeadPostForm;
