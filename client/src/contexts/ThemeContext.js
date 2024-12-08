import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const defaultTheme = {
  colors: {
    primary: {
      main: '#1976d2',
      dark: '#115293',
      light: '#4791db',
      gradient: 'linear-gradient(45deg, #1976d2 30%, #115293 90%)',
      text: '#FFFFFF'
    },
    background: {
      default: '#FFFFFF',
      main: '#F5F5F5',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#333333',
      secondary: '#666666'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    xxl: '4rem'
  },
  typography: {
    size: {
      h1: '2.5rem',
      h2: '2rem',
      h3: '1.75rem',
      h4: '1.5rem',
      body: '1rem'
    }
  },
  transitions: {
    short: '0.3s',
    medium: '0.5s',
    long: '0.7s'
  },
  borderRadius: {
    sm: '2px',
    md: '4px',
    lg: '8px',
    xl: '16px'
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  
  const theme = {
    ...defaultTheme,
    mode,
    colors: {
      ...defaultTheme.colors,
      background: {
        default: mode === 'dark' ? '#121212' : '#FFFFFF',
        main: mode === 'dark' ? '#1E1E1E' : '#F5F5F5',
        paper: mode === 'dark' ? '#242424' : '#FFFFFF'
      },
      text: {
        primary: mode === 'dark' ? '#FFFFFF' : '#333333',
        secondary: mode === 'dark' ? '#AAAAAA' : '#666666'
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme }}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};