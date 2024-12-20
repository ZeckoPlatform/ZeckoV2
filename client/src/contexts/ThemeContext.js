import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

const createMuiTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#4CAF50',
      dark: '#388E3C',
      light: '#81C784',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#F44336',
      light: '#E57373',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#F5F5F5',
      paper: mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#FFFFFF' : '#333333',
      secondary: mode === 'dark' ? '#AAAAAA' : '#666666',
      disabled: mode === 'dark' ? '#666666' : '#999999',
    },
  }
});

const createStyledTheme = (muiTheme) => ({
  colors: {
    primary: muiTheme.palette.primary.main,
    text: muiTheme.palette.text.primary,
    background: muiTheme.palette.background.default,
    error: muiTheme.palette.error.main,
  },
  palette: muiTheme.palette,
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  }
});

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  const muiTheme = useMemo(() => createMuiTheme(mode), [mode]);
  const theme = useMemo(() => createStyledTheme(muiTheme), [muiTheme]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme, muiTheme }}>
      {children}
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