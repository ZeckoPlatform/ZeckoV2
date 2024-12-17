import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { createTheme } from '@mui/material/styles';

const createMuiTheme = (mode) => ({
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
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'dark' ? '#121212' : '#F5F5F5',
        },
      },
    },
  },
});

const createStyledTheme = (muiTheme) => ({
  colors: {
    text: {
      primary: muiTheme.palette.text.primary,
      secondary: muiTheme.palette.text.secondary,
      disabled: muiTheme.palette.text.disabled,
    },
    primary: {
      main: muiTheme.palette.primary.main,
      dark: muiTheme.palette.primary.dark,
      light: muiTheme.palette.primary.light,
      contrastText: muiTheme.palette.primary.contrastText,
    },
    status: {
      error: muiTheme.palette.error.main,
      warning: '#ff9800',
      success: '#4caf50',
    },
    background: {
      default: muiTheme.palette.background.default,
      paper: muiTheme.palette.background.paper,
      main: muiTheme.palette.background.paper,
    },
  },
  input: {
    theme: {
      main: muiTheme.palette.primary.main,
      light: muiTheme.palette.primary.light,
      dark: muiTheme.palette.primary.dark,
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: `${muiTheme.shape.borderRadius}px`,
    lg: '12px',
  },
  typography: {
    size: {
      sm: '12px',
      md: '14px',
      lg: '16px',
    }
  },
  transitions: {
    short: '0.15s ease',
    medium: '0.25s ease',
    long: '0.35s ease',
  }
});

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  const muiTheme = useMemo(() => createTheme(createMuiTheme(mode)), [mode]);
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