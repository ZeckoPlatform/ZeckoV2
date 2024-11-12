import { createTheme } from '@mui/material/styles';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

// MUI theme configuration
export const createMuiTheme = (mode) => {
  const currentTheme = mode === 'dark' ? darkTheme : lightTheme;
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: currentTheme.colors.primary.main,
        dark: currentTheme.colors.primary.dark,
        light: currentTheme.colors.primary.light,
      },
      background: {
        default: currentTheme.colors.background.main,
        paper: currentTheme.colors.background.paper,
      },
      text: {
        primary: currentTheme.colors.text.primary,
        secondary: currentTheme.colors.text.secondary,
      },
    },
    typography: {
      fontFamily: "'Roboto', sans-serif",
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      // Add other typography variants as needed
    },
  });
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
}; 