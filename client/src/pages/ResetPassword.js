import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import zxcvbn from 'zxcvbn';

const ResetPasswordContainer = styled.div`
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

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const { token } = useParams();
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const result = zxcvbn(newPassword);
    setPasswordScore(result.score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (passwordScore < 3) {
      setError('Please choose a stronger password');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <ResetPasswordContainer>
      <h2>Reset Password</h2>
      <Form onSubmit={handleSubmit}>
        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        <PasswordStrength score={passwordScore} />
        <PasswordFeedback score={passwordScore}>
          {passwordScore < 3 ? 'Password is too weak' : 'Password is strong'}
        </PasswordFeedback>
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit">Reset Password</Button>
      </Form>
      {message && <Message>{message}</Message>}
      {error && <Message error>{error}</Message>}
    </ResetPasswordContainer>
  );
}

export default ResetPassword;
