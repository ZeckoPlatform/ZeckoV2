import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { activityLogService } from '../services/activityLogService';
import axios from 'axios';

const LoginContainer = styled.div`
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

const ForgotPasswordLink = styled.a`
  text-align: right;
  margin-bottom: 10px;
  color: var(--primary-color);
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const TwoFactorContainer = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const CodeInput = styled(Input)`
  text-align: center;
  letter-spacing: 4px;
  font-size: 20px;
`;

const AccountTypeSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
`;

const AccountTypeButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #007bff;
  background-color: ${props => props.selected ? '#007bff' : 'white'};
  color: ${props => props.selected ? 'white' : '#007bff'};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #007bff;
    color: white;
  }
`;

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
    accountType: 'personal'
  });
  const [error, setError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        const API_URL = process.env.NODE_ENV === 'production'
            ? 'https://zeckov2-deceb43992ac.herokuapp.com'
            : 'http://localhost:5000';

        // Log the current account type
        console.log('Current account type:', formData.accountType);

        // Determine endpoint
        const endpoint = `${API_URL}/api/${formData.accountType === 'vendor' 
            ? 'vendor' 
            : formData.accountType === 'business' 
                ? 'business' 
                : 'users'}/login`;

        console.log('Using endpoint:', endpoint);

        const response = await axios.post(endpoint, {
            email: formData.email,
            password: formData.password,
            accountType: formData.accountType
        });

        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('accountType', formData.accountType);
            login(response.data.token, {
                ...response.data.user,
                accountType: formData.accountType
            });
            navigate('/dashboard');
        }
    } catch (error) {
        console.error('Login error:', error.response?.data || error);
        setError(error.response?.data?.error || 'Invalid credentials');
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/users/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({
          code: formData.twoFactorCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      login(data.token, data.user);
      
      activityLogService.initializeSocket();
      
      navigate('/dashboard');
    } catch (err) {
      console.error('2FA Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
    }
  };

  // Make sure the account type is set when selecting account type
  const handleAccountTypeSelect = (type) => {
    console.log('Selecting account type:', type);
    setFormData(prev => ({
        ...prev,
        accountType: type
    }));
  };

  if (showTwoFactor) {
    return (
      <LoginContainer>
        <h2>Two-Factor Authentication</h2>
        <TwoFactorContainer>
          <p>Please enter the verification code from your authenticator app</p>
          <Form onSubmit={handleVerify2FA}>
            <CodeInput
              type="text"
              name="twoFactorCode"
              placeholder="Enter code"
              value={formData.twoFactorCode}
              onChange={(e) => setFormData({
                ...formData,
                twoFactorCode: e.target.value.replace(/\D/g, '').slice(0, 6)
              })}
              maxLength="6"
              pattern="\d{6}"
              required
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Button type="submit">Verify</Button>
          </Form>
        </TwoFactorContainer>
      </LoginContainer>
    );
  }

  return (
    <LoginContainer>
      <h2>Login to Zecko</h2>
      
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
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <ForgotPasswordLink 
          onClick={() => navigate('/forgot-password')}
        >
          Forgot Password?
        </ForgotPasswordLink>
        <Button type="submit">Login</Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </LoginContainer>
  );
}

export default Login;
