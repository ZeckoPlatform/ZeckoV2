import React from 'react';
import styled from 'styled-components';
import Sidebar from '../Layout/Sidebar';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme?.colors?.background?.default || '#FFFFFF'};
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme?.spacing?.lg || '24px'};
  margin-left: 280px;
  overflow-y: auto;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const DashboardLayout = ({ children }) => {
  return (
    <DashboardContainer>
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardLayout; 