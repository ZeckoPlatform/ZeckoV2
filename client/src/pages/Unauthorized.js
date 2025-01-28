import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const UnauthorizedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: ${({ theme }) => theme.colors.background.light};
`;

const Unauthorized = () => {
  return (
    <UnauthorizedContainer>
      <h1>Unauthorized Access</h1>
      <p>You don't have permission to access this page.</p>
      <Link to="/dashboard">Return to Dashboard</Link>
    </UnauthorizedContainer>
  );
};

export default Unauthorized; 