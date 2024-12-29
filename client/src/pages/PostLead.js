import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostLead = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
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
  const [loading, setLoading] = useState(false);

  // Add console.log to debug category loading
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        console.log('Fetched categories:', response.data); // Debug log
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Update selected category and reset form fields when category changes
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = categories.find(cat => cat._id === categoryId);
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      subcategory: '',
      requirements: category ? category.questions.map(q => ({ 
        question: q.text,
        answer: '' 
      })) : []
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.category) {
        throw new Error('Please select a category');
      }

      const leadData = {
        ...formData,
        client: user._id,
        requirements: formData.requirements.filter(req => req.answer), // Only send answered questions
      };

      console.log('Submitting lead data:', leadData);
      const response = await api.post('/api/leads', leadData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data?.message || 'Failed to post lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormTitle>Post a New Lead</FormTitle>
      <StyledForm onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FormGroup>
          <Label>Title*</Label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="Enter lead title"
          />
        </FormGroup>

        <FormGroup>
          <Label>Description*</Label>
          <TextArea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            rows={4}
            placeholder="Describe your requirements"
          />
        </FormGroup>

        <FormGroup>
          <Label>Category*</Label>
          <Select 
            value={formData.category} 
            onChange={handleCategoryChange}
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

        <TwoColumnGroup>
          <FormGroup>
            <Label>Minimum Budget*</Label>
            <Input
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
            <Label>Maximum Budget*</Label>
            <Input
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

        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post Lead'}
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
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.primary.light};
    cursor: not-allowed;
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