import React, { useState } from 'react';
import styled from 'styled-components';

const ForgotPasswordContainer = styled.div`
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

const Message = styled.p`
  margin-top: 10px;
  color: ${props => props.error ? 'red' : 'green'};
`;

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <ForgotPasswordContainer>
      <h2>Forgot Password</h2>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit">Reset Password</Button>
      </Form>
      {message && <Message>{message}</Message>}
      {error && <Message error>{error}</Message>}
    </ForgotPasswordContainer>
  );
}

export default ForgotPassword;
