import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    accountType: 'personal', // 'personal', 'business', or 'vendor'
    businessName: '',
    businessType: '',
    vendorCategory: '',
    location: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.register(formData);
      console.log('Registration response:', response);

      if (response?.data?.success) {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login to continue.',
            email: formData.email // Pass email for auto-fill if desired
          }
        });
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <h1>Register</h1>
        {location.state?.message && (
          <SuccessMessage>{location.state.message}</SuccessMessage>
        )}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Account Type</Label>
            <Select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
            >
              <option value="personal">Personal</option>
              <option value="business">Business</option>
              <option value="vendor">Vendor</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Username</Label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </FormGroup>

          {formData.accountType !== 'personal' && (
            <>
              <FormGroup>
                <Label>Business Name</Label>
                <Input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Business Type</Label>
                <Input
                  type="text"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              {formData.accountType === 'vendor' && (
                <FormGroup>
                  <Label>Vendor Category</Label>
                  <Input
                    type="text"
                    name="vendorCategory"
                    value={formData.vendorCategory}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              )}

              <FormGroup>
                <Label>Location</Label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </Form>
      </RegisterCard>
    </RegisterContainer>
  );
};

// Styled components
const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: ${({ theme }) => theme?.colors?.background || '#F5F5F5'};
`;

const RegisterCard = styled.div`
  background: ${({ theme }) => theme?.palette?.background?.paper || '#FFFFFF'};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme?.colors?.text || '#333333'};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme?.palette?.divider || '#e0e0e0'};
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme?.colors?.primary || '#4CAF50'};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  background: white;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme?.colors?.primary || '#4CAF50'};
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme?.colors?.primary || '#4CAF50'};
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: ${({ theme }) => theme?.colors?.primary || '#4CAF50'};
  color: ${({ theme }) => theme?.palette?.primary?.contrastText || '#FFFFFF'};
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme?.palette?.primary?.dark || '#388E3C'};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  color: #008000;
  font-size: 0.875rem;
`;

export default Register;
