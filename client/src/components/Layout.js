import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => 
    theme?.colors?.background?.default || 
    (theme?.mode === 'dark' ? '#121212' : '#FFFFFF')};
  color: ${({ theme }) => 
    theme?.colors?.text?.primary || 
    (theme?.mode === 'dark' ? '#FFFFFF' : '#333333')};
`;

const MainContent = styled.main`
  padding-top: 64px;
`;

const Layout = () => {
  console.log('Current theme:', theme);

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
