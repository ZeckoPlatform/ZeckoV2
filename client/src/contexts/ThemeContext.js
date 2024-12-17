import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { createTheme } from '@mui/material/styles';

// Define base theme
const baseTheme = {
  colors: {
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
      default: '#F5F5F5',
      paper: '#FFFFFF',
      main: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    }
  },
  borderRadius: {
    md: '8px',
  },
  input: {
    theme: {
      main: '#4CAF50'
    }
  },
  palette: {
    primary: {
      main: '#4CAF50'
    }
  }
};

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: baseTheme.colors.primary.main,
      dark: baseTheme.colors.primary.dark,
      light: baseTheme.colors.primary.light,
      contrastText: baseTheme.colors.primary.contrastText,
    },
    error: {
      main: baseTheme.colors.error.main,
      light: baseTheme.colors.error.light,
    },
    background: {
      default: baseTheme.colors.background.default,
      paper: baseTheme.colors.background.paper,
    },
    text: {
      primary: baseTheme.colors.text.primary,
      secondary: baseTheme.colors.text.secondary,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: baseTheme.colors.background.default,
        },
      },
    },
  },
});

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  
  const theme = {
    ...baseTheme,
    mode,
    colors: {
      ...baseTheme.colors,
      background: {
        ...baseTheme.colors.background,
        default: mode === 'dark' ? '#121212' : baseTheme.colors.background.default,
        paper: mode === 'dark' ? '#1E1E1E' : baseTheme.colors.background.paper,
        main: mode === 'dark' ? '#1E1E1E' : baseTheme.colors.background.main,
      },
      text: {
        ...baseTheme.colors.text,
        primary: mode === 'dark' ? '#FFFFFF' : baseTheme.colors.text.primary,
        secondary: mode === 'dark' ? '#AAAAAA' : baseTheme.colors.text.secondary,
        disabled: mode === 'dark' ? '#666666' : baseTheme.colors.text.disabled,
      }
    },
    input: {
      ...baseTheme.input,
      theme: {
        main: mode === 'dark' ? '#81C784' : baseTheme.input.theme.main
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