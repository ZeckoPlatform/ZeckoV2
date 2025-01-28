import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const NotFoundContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  text-decoration: none;
  border-radius: 4px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }
`;

function NotFound() {
  return (
    <NotFoundContainer>
      <Title>Page Not Found</Title>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <BackLink to="/">Back to Home</BackLink>
    </NotFoundContainer>
  );
}

export default NotFound; 