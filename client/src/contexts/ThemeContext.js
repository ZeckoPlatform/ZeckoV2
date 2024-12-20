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
    },
    palette: muiTheme.palette
  }), [muiTheme]);

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