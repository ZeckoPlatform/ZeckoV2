import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme, baseTheme } from '../styles/theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);

  const currentTheme = useMemo(() => ({
    ...baseTheme,
    colors: theme[themeMode]?.colors || theme.light.colors,
  }), [themeMode]);

  const toggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <StyledThemeProvider theme={currentTheme}>
        {children}
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