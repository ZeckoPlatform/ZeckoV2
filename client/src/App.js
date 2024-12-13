import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from './components/Navbar';
import { useAuth } from './contexts/AuthContext';
import { PostLeadForm } from './components/PostLead/PostLeadForm';

const App = () => {
  const { user } = useAuth();

  return (
    <AppContainer>
      <Navbar />
      <MainContent>
        <Outlet />
      </MainContent>
    </AppContainer>
  );
};

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
`;

const MainContent = styled.main`
  padding-top: 60px; // Height of navbar
`;

export default App;
