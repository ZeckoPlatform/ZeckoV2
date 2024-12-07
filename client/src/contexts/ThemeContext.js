import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { muiTheme, theme as baseTheme } from '../styles/theme/index';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

const defaultTheme = {
  mode: 'light',
  colors: {
    primary: {
      main: '#4CAF50',
      dark: '#45a049',
      light: '#81C784',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
      dark: '#121212',
      hover: 'rgba(0, 0, 0, 0.05)'
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    error: '#f44336',
    border: 'rgba(0, 0, 0, 0.1)'
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
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
  },
  shadows: {
    dropdown: '0 2px 8px rgba(0,0,0,0.15)',
    card: '0 2px 4px rgba(0,0,0,0.1)',
  }
};

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
    if (!isThemeReady) return defaultTheme;

    return {
      ...defaultTheme,
      ...baseTheme,
      mode: themeMode,
      colors: {
        ...defaultTheme.colors,
        ...baseTheme.colors,
        background: {
          ...defaultTheme.colors.background,
          ...baseTheme.colors.background,
          default: themeMode === 'dark' 
            ? baseTheme.colors.background.dark 
            : baseTheme.colors.background.default,
        },
        text: {
          ...defaultTheme.colors.text,
          ...baseTheme.colors.text,
          primary: themeMode === 'dark' 
            ? '#E0E0E0' 
            : baseTheme.colors.text.primary,
        }
      }
    };
  }, [themeMode, isThemeReady]);

  const currentMuiTheme = useMemo(() => ({
    ...muiTheme,
    palette: {
      ...muiTheme.palette,
      mode: themeMode,
      background: {
        default: theme.colors.background.default,
        paper: themeMode === 'dark' ? '#1E1E1E' : theme.colors.background.paper,
      },
      text: {
        primary: theme.colors.text.primary,
      }
    }
  }), [themeMode, theme]);

  const toggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!isThemeReady) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, theme }}>
      <StyledThemeProvider theme={theme}>
        <MUIThemeProvider theme={currentMuiTheme}>
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