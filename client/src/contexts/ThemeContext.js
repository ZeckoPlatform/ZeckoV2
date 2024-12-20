import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';

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

  const value = useMemo(() => ({
    mode,
    setMode,
    theme: theme || defaultTheme,
    muiTheme
  }), [mode, theme, muiTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: defaultTheme, muiTheme: createMuiTheme('light') };
  }
  return context;
};