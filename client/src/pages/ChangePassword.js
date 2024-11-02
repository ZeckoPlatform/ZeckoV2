import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ChangePasswordContainer = styled.div`
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
  margin-top: 10px;

  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

const Message = styled.p`
  margin-top: 10px;
  color: ${props => props.error ? 'red' : 'green'};
`;

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <ChangePasswordContainer>
      <h2>Change Password</h2>
      <Form onSubmit={handleSubmit}>
        <Input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit">Change Password</Button>
      </Form>
      {message && <Message>{message}</Message>}
      {error && <Message error>{error}</Message>}
    </ChangePasswordContainer>
  );
}

export default ChangePassword;
