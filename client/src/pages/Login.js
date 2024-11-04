import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { activityLogService } from '../services/activityLogService';

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

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  });
  const [error, setError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

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
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.need2FA) {
        setShowTwoFactor(true);
        setTempToken(data.tempToken);
        return;
      }

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        activityLogService.initializeSocket();
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Sending 2FA verification:', {
        tempToken,
        code: formData.twoFactorCode
      });

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

      console.log('2FA verification successful:', data);

      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      activityLogService.initializeSocket();
      
      navigate('/dashboard');
    } catch (err) {
      console.error('2FA Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
    }
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
