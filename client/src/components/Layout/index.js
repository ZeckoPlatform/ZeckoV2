import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-left: ${({ isDashboard }) => isDashboard ? '280px' : '0'};
`;

const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <LayoutWrapper>
      <Header />
      {isDashboard && isAuthenticated && <Sidebar />}
      <MainContent isDashboard={isDashboard}>
        {children}
      </MainContent>
      <Footer />
    </LayoutWrapper>
  );
};

export default Layout; 