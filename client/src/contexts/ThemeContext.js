import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { muiTheme, theme as baseTheme } from '../styles/theme/index';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

// Ensure theme is always available
const getTheme = (mode = 'light') => ({
  mode,
  colors: {
    primary: {
      main: '#4CAF50',
      dark: '#45a049',
      light: '#81C784',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#FFFFFF',
      paper: mode === 'dark' ? '#1E1E1E' : '#F5F5F5',
      dark: '#121212',
      hover: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      main: mode === 'dark' ? '#121212' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#FFFFFF' : '#333333',
      secondary: mode === 'dark' ? '#CCCCCC' : '#666666',
      disabled: mode === 'dark' ? '#666666' : '#999999',
    },
    error: '#f44336',
    border: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  transitions: {
    short: '0.15s',
    medium: '0.3s',
    long: '0.5s',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
  },
  zIndex: {
    drawer: 1200,
    modal: 1300,
    tooltip: 1400,
  },
  shadows: {
    card: '0 2px 4px rgba(0,0,0,0.1)',
    hover: '0 4px 8px rgba(0,0,0,0.2)',
    dropdown: '0 2px 8px rgba(0,0,0,0.15)',
  },
  glass: {
    background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    border: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  },
  typography: {
    weight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
    size: {
      h1: '2.5rem',
      h2: '2rem',
      h3: '1.75rem',
      h4: '1.5rem',
      h5: '1.25rem',
      h6: '1rem',
      body: '1rem',
      small: '0.875rem',
    },
  },
});

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('dark');
  const [isThemeReady, setIsThemeReady] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
    setIsThemeReady(true);
  }, []);

  const theme = useMemo(() => {
    return getTheme(themeMode);
  }, [themeMode]);

  const contextValue = useMemo(() => ({
    themeMode,
    toggleTheme: () => {
      const newTheme = themeMode === 'light' ? 'dark' : 'light';
      setThemeMode(newTheme);
      localStorage.setItem('theme', newTheme);
    },
    theme
  }), [themeMode, theme]);

  console.log('Current theme:', theme);

  if (!isThemeReady) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>
        <MUIThemeProvider theme={muiTheme}>
          <CssBaseline />
          {children}
        </MUIThemeProvider>
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};