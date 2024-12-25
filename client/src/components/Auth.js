import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Submitting login form...');
      const result = await login({ email, password });
      console.log('Login result:', result);

      if (result.success) {
        console.log('Login successful, navigating...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error('Login submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      {isLoading && <div>Loading...</div>}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

export function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    accountType: 'Regular',
    businessName: '',
    businessType: ''
  });
  const navigate = useNavigate();
  const { register, error } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'accountType') {
      const normalizedValue = {
        'customer': 'Regular',
        'business': 'Business',
        'seller': 'Vendor'
      }[value] || value;
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: normalizedValue,
        ...(normalizedValue === 'Regular' && {
          businessName: '',
          businessType: ''
        })
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <div className="error">{error}</div>}
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="accountType">Account Type:</label>
        <select
          id="accountType"
          name="accountType"
          value={formData.accountType === 'Regular' ? 'customer' : 
                 formData.accountType === 'Business' ? 'business' : 
                 formData.accountType === 'Vendor' ? 'seller' : 'customer'}
          onChange={handleChange}
        >
          <option value="customer">Customer</option>
          <option value="business">Business</option>
          <option value="seller">Seller</option>
        </select>
      </div>
      {(formData.accountType === 'Business' || formData.accountType === 'Vendor') && (
        <>
          <div>
            <label htmlFor="businessName">Business Name:</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required={formData.accountType !== 'Regular'}
            />
          </div>
          <div>
            <label htmlFor="businessType">Business Type:</label>
            <input
              type="text"
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              required={formData.accountType !== 'Regular'}
            />
          </div>
        </>
      )}
      <button type="submit">Register</button>
    </form>
  );
}
