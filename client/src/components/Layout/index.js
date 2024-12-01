import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useLocation, Outlet } from 'react-router-dom';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.main};
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: ${({ isDashboard }) => isDashboard ? '100%' : '1400px'};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-left: ${({ isDashboard }) => isDashboard ? '280px' : '0'};
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
    margin-left: 0;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
`;

const Layout = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isAuthPage) {
    return <MainContent><Outlet /></MainContent>;
  }

  return (
    <LayoutWrapper>
      <Header />
      <ContentWrapper>
        {isDashboard && <Sidebar />}
        <MainContent isDashboard={isDashboard}>
          <Outlet />
        </MainContent>
      </ContentWrapper>
      <Footer />
    </LayoutWrapper>
  );
};

export default Layout; 