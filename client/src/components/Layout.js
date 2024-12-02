import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MainContent = styled.main`
  padding-top: 64px; // Adjust based on your navigation height
`;

const Layout = () => {
  return (
    <LayoutContainer>
      <Navigation />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
