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
    requirements: [], // Array to store answers to category-specific questions
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

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        setCategories(response.data.filter(cat => cat.active)); // Only show active categories
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
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {/* Title */}
      <FormGroup>
        <Label>Title*</Label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </FormGroup>

      {/* Description */}
      <FormGroup>
        <Label>Description*</Label>
        <TextArea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
          rows={4}
        />
      </FormGroup>

      {/* Category */}
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

      {/* Subcategories */}
      {selectedCategory?.subcategories?.length > 0 && (
        <FormGroup>
          <Label>Subcategory</Label>
          <Select
            value={formData.subcategory}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              subcategory: e.target.value
            }))}
          >
            <option value="">Select a subcategory</option>
            {selectedCategory.subcategories.map(sub => (
              <option key={sub.slug} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </Select>
        </FormGroup>
      )}

      {/* Budget */}
      <FormGroup>
        <Label>Budget*</Label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <Label>Minimum</Label>
            <Input
              type="number"
              value={formData.budget.min}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                budget: { ...prev.budget, min: e.target.value }
              }))}
              required
              min="0"
            />
          </div>
          <div style={{ flex: 1 }}>
            <Label>Maximum</Label>
            <Input
              type="number"
              value={formData.budget.max}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                budget: { ...prev.budget, max: e.target.value }
              }))}
              required
              min="0"
            />
          </div>
        </div>
      </FormGroup>

      {/* Location */}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <Input
            type="text"
            placeholder="City"
            value={formData.location.city}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, city: e.target.value }
            }))}
          />
          <Input
            type="text"
            placeholder="State"
            value={formData.location.state}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, state: e.target.value }
            }))}
          />
          <Input
            type="text"
            placeholder="Country"
            value={formData.location.country}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, country: e.target.value }
            }))}
          />
          <Input
            type="text"
            placeholder="Postal Code"
            value={formData.location.postalCode}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, postalCode: e.target.value }
            }))}
          />
        </div>
      </FormGroup>

      {/* Dynamic Questions */}
      {selectedCategory?.questions?.map((question, index) => (
        <FormGroup key={index}>
          <Label>{question.text}{question.required && '*'}</Label>
          {question.type === 'multiple_choice' ? (
            <Select
              value={formData.requirements[index]?.answer || ''}
              onChange={(e) => {
                const newRequirements = [...formData.requirements];
                newRequirements[index] = {
                  question: question.text,
                  answer: e.target.value
                };
                setFormData(prev => ({ ...prev, requirements: newRequirements }));
              }}
              required={question.required}
            >
              <option value="">Select an option</option>
              {question.options.map((option, i) => (
                <option key={i} value={option}>{option}</option>
              ))}
            </Select>
          ) : (
            <Input
              type={question.type === 'date' ? 'date' : 'text'}
              value={formData.requirements[index]?.answer || ''}
              onChange={(e) => {
                const newRequirements = [...formData.requirements];
                newRequirements[index] = {
                  question: question.text,
                  answer: e.target.value
                };
                setFormData(prev => ({ ...prev, requirements: newRequirements }));
              }}
              required={question.required}
            />
          )}
        </FormGroup>
      ))}

      <Button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post Lead'}
      </Button>
    </form>
  );
};

// Styled components (add these if you haven't already)
const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Button = styled.button`
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.primary.light};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.error.light};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  resize: vertical;
`;

export default PostLead; 