import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const LayoutContainer = styled.div.attrs(props => ({
  theme: props.theme || { 
    colors: { 
      background: { default: '#FFFFFF' },
      text: { primary: '#333333' }
    },
    mode: 'light'
  }
}))`
  min-height: 100vh;
  background: ${({ theme }) => {
    console.log('Theme in styled component:', theme);
    return theme?.colors?.background?.default || '#FFFFFF';
  }};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#333333'};
`;

const MainContent = styled.main`
  padding-top: 64px;
`;

const Layout = () => {
  const { themeMode, theme } = useTheme();
  console.log('Current theme mode:', themeMode);
  console.log('Current theme:', theme);

  return (
    <LayoutContainer theme={theme}>
      <Navigation />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
