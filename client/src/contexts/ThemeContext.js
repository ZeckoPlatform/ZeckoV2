import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const ThemeContext = createContext();

const defaultTheme = {
  colors: {
    primary: '#4CAF50',
    text: '#333333',
    background: '#F5F5F5',
    error: '#F44336',
    border: '#E0E0E0',
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50',
      dark: '#388E3C',
      light: '#81C784',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px'
  },
  shadows: {
    card: '0 2px 4px rgba(0,0,0,0.1)',
    dropdown: '0 4px 8px rgba(0,0,0,0.1)',
    modal: '0 8px 16px rgba(0,0,0,0.1)'
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  
  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: defaultTheme.palette.primary,
      background: {
        default: mode === 'dark' ? '#121212' : defaultTheme.palette.background.default,
        paper: mode === 'dark' ? '#1E1E1E' : defaultTheme.palette.background.paper,
      },
      text: {
        primary: mode === 'dark' ? '#FFFFFF' : defaultTheme.palette.text.primary,
        secondary: mode === 'dark' ? '#AAAAAA' : defaultTheme.palette.text.secondary,
      },
    }
  }), [mode]);

  const theme = useMemo(() => ({
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: muiTheme.palette.primary.main,
      text: muiTheme.palette.text.primary,
      background: muiTheme.palette.background.default,
      border: mode === 'dark' ? '#333333' : '#E0E0E0',
    },
    palette: muiTheme.palette,
    spacing: defaultTheme.spacing,
    borderRadius: defaultTheme.borderRadius,
    shadows: defaultTheme.shadows,
    typography: defaultTheme.typography
  }), [muiTheme, mode]);

  const contextValue = useMemo(() => ({
    mode,
    setMode,
    theme,
    muiTheme
  }), [mode, theme, muiTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <StyledThemeProvider theme={theme}>
          {children}
        </StyledThemeProvider>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.warn('useTheme must be used within a ThemeProvider');
    return {
      mode: 'light',
      setMode: () => {},
      theme: defaultTheme,
      muiTheme: createTheme(defaultTheme.palette)
    };
  }
  return context;
};