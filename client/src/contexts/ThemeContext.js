import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const ThemeContext = createContext();

// Default theme values
const defaultTheme = {
  colors: {
    primary: '#4CAF50',
    text: '#333333',
    background: '#F5F5F5',
    error: '#F44336',
  },
  palette: {
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
    xl: '32px',
  }
};

const createMuiTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: defaultTheme.palette.primary,
    error: {
      main: defaultTheme.colors.error,
      light: '#E57373',
    },
    background: {
      default: mode === 'dark' ? '#121212' : defaultTheme.palette.background.default,
      paper: mode === 'dark' ? '#1E1E1E' : defaultTheme.palette.background.paper,
    },
    text: {
      primary: mode === 'dark' ? '#FFFFFF' : defaultTheme.palette.text.primary,
      secondary: mode === 'dark' ? '#AAAAAA' : defaultTheme.palette.text.secondary,
      disabled: mode === 'dark' ? '#666666' : '#999999',
    },
  }
});

const createStyledTheme = (muiTheme) => ({
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: muiTheme.palette.primary.main,
    text: muiTheme.palette.text.primary,
    background: muiTheme.palette.background.default,
    error: muiTheme.palette.error.main,
  },
  palette: muiTheme.palette,
});

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  const muiTheme = useMemo(() => createMuiTheme(mode), [mode]);
  const theme = useMemo(() => createStyledTheme(muiTheme), [muiTheme]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme, muiTheme }}>
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