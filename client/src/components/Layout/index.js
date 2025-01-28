import React from 'react';
import styled from 'styled-components';
import Navbar from '../Navbar';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const MainContent = styled.main`
  padding-top: 64px; // Adjust based on your navbar height
`;

const Layout = ({ children }) => {
  return (
    <LayoutWrapper>
      <Navbar />
      <MainContent>
        {children}
      </MainContent>
    </LayoutWrapper>
  );
};

export default Layout; 