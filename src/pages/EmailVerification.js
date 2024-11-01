import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const VerificationContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
`;

const Message = styled.p`
  margin-top: 20px;
  font-size: 18px;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

function EmailVerification() {
  const [verificationStatus, setVerificationStatus] = useState('Verifying...');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/verify-email/${token}`);
        const data = await response.json();

        if (response.ok) {
          setVerificationStatus('Email verified successfully. You can now log in.');
        } else {
          setVerificationStatus(data.error || 'Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Error during email verification:', error);
        setVerificationStatus('An error occurred during verification. Please try again later.');
      }
    };

    verifyEmail();
  }, [token]);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <VerificationContainer>
      <h2>Email Verification</h2>
      <Message>{verificationStatus}</Message>
      {verificationStatus.includes('successfully') && (
        <Button onClick={handleLoginRedirect}>Go to Login</Button>
      )}
    </VerificationContainer>
  );
}

export default EmailVerification;
