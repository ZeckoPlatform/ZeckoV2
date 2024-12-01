import React from 'react';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.main};
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-left: ${({ isDashboard }) => isDashboard ? '280px' : '0'};
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const Layout = () => {
  const location = useLocation();
  const { loading } = useAuth();
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (location.pathname === '/login') {
    return (
      <MainContent>
        <Outlet />
      </MainContent>
    );
  }

  return (
    <LayoutWrapper>
      <Header />
      {isDashboard && <Sidebar />}
      <MainContent isDashboard={isDashboard}>
        <Outlet />
      </MainContent>
      <Footer />
    </LayoutWrapper>
  );
};

export default Layout; 