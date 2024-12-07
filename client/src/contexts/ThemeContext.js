import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { muiTheme, theme as baseTheme } from '../styles/theme/index';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

const defaultTheme = {
  colors: {
    background: {
      default: '#FFFFFF',
      dark: '#121212',
      paper: '#F5F5F5'
    },
    text: {
      primary: '#333333',
      secondary: '#666666'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('dark');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);

  const theme = useMemo(() => ({
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
  }), [themeMode]);

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

  console.log('Theme being provided:', theme);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
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