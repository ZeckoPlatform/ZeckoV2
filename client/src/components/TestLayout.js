import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';

const TestWrapper = styled.div`
  min-height: 100vh;
  background: #121212;
  color: white;
  padding: 20px;
`;

const TestLayout = () => {
  return (
    <TestWrapper>
      <h1>Test Layout</h1>
      <Outlet />
    </TestWrapper>
  );
};

export default TestLayout; 