import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme as baseTheme } from '../styles/theme';

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
        primary: mode === 'dark' ? '#FFFFFF' : baseTheme.colors.text.primary,
        secondary: mode === 'dark' ? '#AAAAAA' : baseTheme.colors.text.secondary,
        disabled: mode === 'dark' ? '#666666' : baseTheme.colors.text.disabled,
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