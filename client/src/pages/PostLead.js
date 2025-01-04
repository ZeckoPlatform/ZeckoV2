import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useServiceCategories } from '../contexts/ServiceCategoryContext';

const PostLead = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log('Current user:', user);
  const { categories, loading, error: categoryError } = useServiceCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    budget: {
      min: '0',
      max: '0',
      currency: 'GBP'
    },
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    requirements: []
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <Container>
        <FormTitle>Loading categories...</FormTitle>
      </Container>
    );
  }

  // Show error state
  if (categoryError) {
    return (
      <Container>
        <ErrorMessage>{categoryError}</ErrorMessage>
      </Container>
    );
  }

  // Add this debug log
  console.log('All categories:', categories);

  // Update selected category and reset form fields when category changes
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    console.log('Selected category ID:', categoryId);
    const selectedCat = categories.find(cat => cat._id === categoryId);
    console.log('Found category:', selectedCat);
    setSelectedCategory(selectedCat);
    
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      subcategory: '',
      requirements: []
    }));
  };

  // Add this helper function to get subcategories
  const getSubcategories = () => {
    console.log('Getting subcategories for:', selectedCategory); // Debug log
    if (!selectedCategory) return [];
    const subs = selectedCategory.subcategories || [];
    console.log('Found subcategories:', subs); // Debug log
    return subs;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || !formData.subcategory) {
        throw new Error('Please fill in all required fields');
      }

      // Parse and validate budget numbers
      const minBudget = Number(formData.budget.min);
      const maxBudget = Number(formData.budget.max);
      
      if (isNaN(minBudget) || isNaN(maxBudget)) {
        throw new Error('Please enter valid budget numbers');
      }

      // Format location as a single string
      const locationAddress = `${formData.location.address}, ${formData.location.city}, ${formData.location.state}, ${formData.location.country}, ${formData.location.postalCode}`.trim();

      // Prepare the lead data
      const leadData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory,
        budget: {
          min: minBudget,
          max: maxBudget,
          currency: formData.budget.currency || 'GBP'
        },
        location: {
          address: locationAddress,
          city: formData.location.city,
          state: formData.location.state,
          country: formData.location.country,
          postalCode: formData.location.postalCode
        },
        requirements: formData.requirements.length > 0 ? 
          formData.requirements.map(req => ({
            question: String(req.question || ''),
            answer: String(req.answer || '')
          })) : []
      };

      console.log('Submitting lead data:', leadData);
      const response = await api.post('/api/leads', leadData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update budget change handler
  const handleBudgetChange = (field) => (e) => {
    const value = e.target.value;
    // Only allow positive numbers or empty string
    if (value === '' || (/^\d*\.?\d*$/.test(value) && !isNaN(parseFloat(value)))) {
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          [field]: value
        }
      }));
    }
  };

  // Update location change handler
  const handleLocationChange = (field) => (e) => {
    const value = e.target.value || '';
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  // Add subcategory change handler
  const handleSubcategoryChange = (e) => {
    const value = e.target.value;
    console.log('Selected subcategory:', value); // Debug log
    setFormData(prev => ({
      ...prev,
      subcategory: value
    }));
  };

  // Optional: Add a currency selector to your form
  const handleCurrencyChange = (e) => {
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        currency: e.target.value
      }
    }));
  };

  return (
    <Container>
      <FormTitle>Post a New Lead</FormTitle>
      <StyledForm onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FormGroup>
          <Label htmlFor="title">Title*</Label>
          <Input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="Enter lead title"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Description*</Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            rows={4}
            placeholder="Describe your requirements"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="category">Category*</Label>
          <Select 
            id="category"
            name="category"
            value={formData.category} 
            onChange={handleCategoryChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option 
                key={cat._id} 
                value={cat._id}
              >
                {cat.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        {selectedCategory && (
          <FormGroup>
            <Label htmlFor="subcategory">Subcategory*</Label>
            <Select
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleSubcategoryChange}
              required
            >
              <option value="">Select a subcategory</option>
              {getSubcategories().map((sub, index) => (
                <option 
                  key={`${selectedCategory._id}-sub-${index}`}
                  value={sub}
                >
                  {sub}
                </option>
              ))}
            </Select>
          </FormGroup>
        )}

        <TwoColumnGroup>
          <FormGroup>
            <Label htmlFor="budgetMin">Minimum Budget*</Label>
            <Input
              type="number"
              id="budgetMin"
              name="budgetMin"
              value={formData.budget.min}
              onChange={handleBudgetChange('min')}
              required
              min="0"
              step="0.01"
              placeholder="Min budget"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="budgetMax">Maximum Budget*</Label>
            <Input
              type="number"
              id="budgetMax"
              name="budgetMax"
              value={formData.budget.max}
              onChange={handleBudgetChange('max')}
              required
              min="0"
              step="0.01"
              placeholder="Max budget"
            />
          </FormGroup>
        </TwoColumnGroup>

        <FormGroup>
          <Label htmlFor="currency">Currency</Label>
          <Select
            id="currency"
            name="currency"
            value={formData.budget.currency}
            onChange={handleCurrencyChange}
          >
            <option value="GBP">£ (GBP)</option>
            <option value="USD">$ (USD)</option>
            <option value="EUR">€ (EUR)</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Location</Label>
          <Input
            type="text"
            id="address"
            name="address"
            value={formData.location.address}
            onChange={handleLocationChange('address')}
            placeholder="Address"
          />
        </FormGroup>

        <TwoColumnGroup>
          <FormGroup>
            <Input
              type="text"
              placeholder="City"
              value={formData.location.city}
              onChange={handleLocationChange('city')}
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="text"
              placeholder="State"
              value={formData.location.state}
              onChange={handleLocationChange('state')}
            />
          </FormGroup>
        </TwoColumnGroup>

        <TwoColumnGroup>
          <FormGroup>
            <Input
              type="text"
              placeholder="Country"
              value={formData.location.country}
              onChange={handleLocationChange('country')}
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="text"
              placeholder="Postal Code"
              value={formData.location.postalCode}
              onChange={handleLocationChange('postalCode')}
            />
          </FormGroup>
        </TwoColumnGroup>

        <SubmitButton 
          type="submit" 
          disabled={
            isSubmitting || 
            !formData.title || 
            !formData.description || 
            !formData.category || 
            !formData.subcategory ||
            !formData.budget.min ||
            !formData.budget.max
          }
        >
          {isSubmitting ? 'Posting...' : 'Post Lead'}
        </SubmitButton>
      </StyledForm>
    </Container>
  );
};

// Styled components with improved styling
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const FormTitle = styled.h1`
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StyledForm = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const TwoColumnGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: ${({ theme, disabled }) => 
    disabled ? '#e0e0e0' : '#4CAF50'};
  color: ${({ disabled }) => disabled ? '#757575' : 'white'};
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ disabled }) => 
      disabled ? '#e0e0e0' : '#45a049'};
  }

  &:active {
    background-color: ${({ disabled }) => 
      disabled ? '#e0e0e0' : '#3d8b40'};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  background-color: ${({ theme }) => theme.colors.error.light};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

export default PostLead; 