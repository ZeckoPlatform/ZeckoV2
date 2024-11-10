import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.main};
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  if (isAuthPage) {
    return <MainContent>{children}</MainContent>;
  }

  return (
    <LayoutWrapper>
      <Header />
      <MainContent>{children}</MainContent>
      <Footer />
    </LayoutWrapper>
  );
};

export default Layout; 