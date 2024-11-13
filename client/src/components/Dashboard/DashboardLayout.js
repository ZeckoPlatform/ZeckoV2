import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
`;

const DashboardLayout = () => {
  return (
    <DashboardContainer>
      <MainContent>
        <Outlet />
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardLayout; 