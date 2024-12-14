import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from './components/Navbar';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';

const App = () => {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <AppContainer>
        <Navbar />
        <MainContent>
          <Outlet />
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
};

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.3s ease;
`;

const MainContent = styled.main`
  padding-top: 60px; // Height of navbar
  min-height: calc(100vh - 60px);
`;

export default App;
