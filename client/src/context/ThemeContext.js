import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme, lightTheme, darkTheme } from '../styles/theme';
import GlobalStyles from '../styles/GlobalStyles';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  const currentTheme = themeMode === 'dark' ? 
    { ...theme.dark } : 
    { ...theme.light };

  useEffect(() => {
    localStorage.setItem('theme', themeMode);
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme: themeMode, toggleTheme }}>
      <StyledThemeProvider theme={currentTheme}>
        <GlobalStyles />
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