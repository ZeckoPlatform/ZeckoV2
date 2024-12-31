import React, { useState, useCallback } from 'react';
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
  const { categories, loading: categoriesLoading } = useServiceCategories();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedCategory = categories.find(cat => cat.name === category);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          title, 
          description, 
          budget: parseFloat(budget),
          category,
          subcategory
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to post job');
      }
      
      const newJob = await response.json();
      onJobPosted(newJob);
      setTitle('');
      setDescription('');
      setBudget('');
      setCategory('');
      setSubcategory('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [title, description, budget, category, subcategory, onJobPosted]);

  if (categoriesLoading) {
    return <Spinner />;
  }

  return (
    <FormContainer onSubmit={handleSubmit} aria-labelledby="job-post-form-title">
      <h2 id="job-post-form-title">Post a New Job</h2>
      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
      
      <FormGroup>
        <Label htmlFor="job-title">Job Title</Label>
        <Input
          id="job-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
          aria-required="true"
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="job-description">Job Description</Label>
        <TextArea
          id="job-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={loading}
          aria-required="true"
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="job-budget">Budget</Label>
        <Input
          id="job-budget"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
          disabled={loading}
          aria-required="true"
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="job-category">Category</Label>
        <Select
          id="job-category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubcategory(''); // Reset subcategory when category changes
          }}
          required
          disabled={loading}
          aria-required="true"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </Select>
      </FormGroup>

      {selectedCategory && selectedCategory.subcategories.length > 0 && (
        <FormGroup>
          <Label htmlFor="job-subcategory">Subcategory</Label>
          <Select
            id="job-subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            required
            disabled={loading}
            aria-required="true"
          >
            <option value="">Select a subcategory</option>
            {selectedCategory.subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </FormGroup>
      )}

      <SubmitButton type="submit" disabled={loading} aria-busy={loading}>
        {loading ? <Spinner /> : 'Post Job'}
      </SubmitButton>
    </FormContainer>
  );
}

export default JobPostForm;
