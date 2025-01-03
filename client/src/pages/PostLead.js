import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useServiceCategories } from '../contexts/ServiceCategoryContext';

const PostLead = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, loading, error: categoryError } = useServiceCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    budget: {
      min: '',
      max: '',
      currency: 'USD'
    },
    requirements: [],
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    }
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
    console.log('Category ID selected:', categoryId); // Debug log
    const selectedCat = categories.find(cat => cat._id === categoryId);
    console.log('Selected category object:', selectedCat); // Debug log
    setSelectedCategory(selectedCat);
    
    // Log the subcategories immediately
    console.log('Subcategories of selected category:', selectedCat?.subcategories);
    
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      subcategory: '',
      requirements: selectedCat?.questions?.map(q => ({ 
        question: q.text,
        answer: '' 
      })) || []
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

      // Validate budget
      if (Number(formData.budget.min) < 0 || Number(formData.budget.max) < 0) {
        throw new Error('Budget values must be positive numbers');
      }
      if (Number(formData.budget.max) < Number(formData.budget.min)) {
        throw new Error('Maximum budget must be greater than or equal to minimum budget');
      }

      const leadData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory,
        budget: {
          min: Number(formData.budget.min) || 0,
          max: Number(formData.budget.max) || 0,
          currency: formData.budget.currency
        },
        location: {
          address: formData.location.address?.trim(),
          city: formData.location.city?.trim(),
          state: formData.location.state?.trim(),
          country: formData.location.country?.trim(),
          postalCode: formData.location.postalCode?.trim()
        },
        client: user._id,
        requirements: formData.requirements.filter(req => req.answer?.trim())
      };

      console.log('Submitting lead data:', JSON.stringify(leadData, null, 2));
      const response = await api.post('/api/leads', leadData);
      console.log('Lead posted successfully:', response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error details:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to post lead');
    } finally {
      setIsSubmitting(false);
    }
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
                key={cat?._id || 'default'} 
                value={cat?._id || ''}
              >
                {cat?.name || 'Unnamed Category'}
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
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  subcategory: e.target.value
                }));
              }}
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
              id="budgetMin"
              name="budgetMin"
              type="number"
              value={formData.budget.min}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                budget: { ...prev.budget, min: Number(e.target.value) }
              }))}
              required
              min="0"
              placeholder="Min budget"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="budgetMax">Maximum Budget*</Label>
            <Input
              id="budgetMax"
              name="budgetMax"
              type="number"
              value={formData.budget.max}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                budget: { ...prev.budget, max: Number(e.target.value) }
              }))}
              required
              min="0"
              placeholder="Max budget"
            />
          </FormGroup>
        </TwoColumnGroup>

        <FormGroup>
          <Label>Location</Label>
          <Input
            type="text"
            placeholder="Address"
            value={formData.location.address}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, address: e.target.value }
            }))}
          />
        </FormGroup>

        <TwoColumnGroup>
          <FormGroup>
            <Input
              type="text"
              placeholder="City"
              value={formData.location.city}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, city: e.target.value }
              }))}
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="text"
              placeholder="State"
              value={formData.location.state}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, state: e.target.value }
              }))}
            />
          </FormGroup>
        </TwoColumnGroup>

        <TwoColumnGroup>
          <FormGroup>
            <Input
              type="text"
              placeholder="Country"
              value={formData.location.country}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, country: e.target.value }
              }))}
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="text"
              placeholder="Postal Code"
              value={formData.location.postalCode}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, postalCode: e.target.value }
              }))}
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