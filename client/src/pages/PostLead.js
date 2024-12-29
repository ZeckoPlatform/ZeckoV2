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
      
      {/* Basic Information */}
      <FormGroup>
        <Label>Category</Label>
        <Select 
          value={formData.category} 
          onChange={handleCategoryChange}
        >
          <option value="">Select a category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </FormGroup>

      {/* Subcategories (if available) */}
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

      {/* Dynamic Questions based on category */}
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

      {/* Rest of your form fields */}
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

export default PostLead; 