import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from './components/Navbar';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import { withErrorBoundary } from './components/error/withErrorBoundary';

const App = () => {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppContainer>
          <Navbar />
          <MainContent>
            <Outlet />
          </MainContent>
        </AppContainer>
      </ErrorBoundary>
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

// Wrap the entire App with error boundary
export default withErrorBoundary(App, {
  fallback: <div>Something went wrong. Please refresh the page.</div>,
  onError: (error, errorInfo) => {
    // Log error to your error tracking service
    console.error('App Error:', error, errorInfo);
  }
});
