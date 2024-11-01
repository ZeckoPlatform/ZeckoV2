import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import zxcvbn from 'zxcvbn';
import { useAuth } from '../context/AuthContext';

const RegisterContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 8px;
  font-size: 16px;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;
`;

const PasswordStrength = styled.div`
  margin-top: 5px;
  height: 5px;
  background-color: ${props => {
    if (props.score === 0) return 'red';
    if (props.score === 1) return 'orange';
    if (props.score === 2) return 'yellow';
    if (props.score === 3) return 'lightgreen';
    if (props.score === 4) return 'green';
  }};
  width: ${props => (props.score + 1) * 20}%;
`;

const PasswordFeedback = styled.p`
  font-size: 14px;
  margin-top: 5px;
  color: ${props => props.score <= 2 ? 'red' : 'green'};
`;

const AccountTypeSelector = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

const AccountTypeButton = styled.button`
  padding: 10px 20px;
  border: 2px solid var(--primary-color);
  background-color: ${props => props.selected ? 'var(--primary-color)' : 'white'};
  color: ${props => props.selected ? 'white' : 'var(--primary-color)'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;

  &:hover {
    background-color: ${props => props.selected ? 'var(--primary-color)' : '#f0f0f0'};
  }
`;

const Select = styled.select`
  margin-bottom: 10px;
  padding: 8px;
  font-size: 16px;
`;

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    accountType: '',
    businessName: '',
    businessType: '',
    vendorCategory: ''
  });
  const [error, setError] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData(prev => ({ ...prev, password: newPassword }));
    const result = zxcvbn(newPassword);
    setPasswordScore(result.score);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAccountTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      accountType: type
    }));
  };

  const renderVendorFields = () => {
    if (formData.accountType === 'vendor') {
      return (
        <>
          <Input
            type="text"
            placeholder="Business Name"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
          />
          <Input
            type="text"
            placeholder="Business Type"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            required
          />
          <Select
            name="vendorCategory"
            value={formData.vendorCategory}
            onChange={handleChange}
            required
          >
            <option value="">Select Vendor Category</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="service">Service Provider</option>
          </Select>
        </>
      );
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.accountType) {
      setError('Please select an account type');
      return;
    }

    if (passwordScore < 3) {
      setError('Please choose a stronger password');
      return;
    }

    if (formData.accountType === 'vendor') {
      if (!formData.businessName || !formData.businessType || !formData.vendorCategory) {
        setError('Please fill in all vendor information');
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <RegisterContainer>
      <h2>Register for Zecko</h2>
      
      <AccountTypeSelector>
        <AccountTypeButton
          type="button"
          selected={formData.accountType === 'personal'}
          onClick={() => handleAccountTypeSelect('personal')}
        >
          Personal Account
        </AccountTypeButton>
        <AccountTypeButton
          type="button"
          selected={formData.accountType === 'business'}
          onClick={() => handleAccountTypeSelect('business')}
        >
          Business Account
        </AccountTypeButton>
        <AccountTypeButton
          type="button"
          selected={formData.accountType === 'vendor'}
          onClick={() => handleAccountTypeSelect('vendor')}
        >
          Vendor Account
        </AccountTypeButton>
      </AccountTypeSelector>

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {renderVendorFields()}
        <Input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handlePasswordChange}
          required
        />
        <PasswordStrength score={passwordScore} />
        <PasswordFeedback score={passwordScore}>
          {passwordScore < 3 ? 'Password is too weak' : 'Password is strong'}
        </PasswordFeedback>
        <Button type="submit">Register</Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </RegisterContainer>
  );
}

export default Register;
