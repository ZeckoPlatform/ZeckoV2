import { createTheme } from '@mui/material/styles';

// Define base design tokens
const tokens = {
  colors: {
    primary: {
      main: '#81C784',
      dark: '#4CAF50',
      light: '#C8E6C9',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)',
    },
    secondary: {
      main: '#64B5F6',
      dark: '#1E88E5',
      light: '#90CAF9',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #64B5F6 0%, #1E88E5 100%)',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
      gradient: 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#BDBDBD',
      disabled: 'rgba(255, 255, 255, 0.38)',
      hint: 'rgba(255, 255, 255, 0.38)',
    },
    status: {
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#2196f3',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  typography: {
    size: {
      h1: '2.5rem',
      h2: '2rem',
      h3: '1.75rem',
      h4: '1.5rem',
      h5: '1.25rem',
      h6: '1rem',
    },
    weight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      normal: 1.5,
    },
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '2rem',
  },
  shadows: {
    card: '0 4px 6px rgba(0, 0, 0, 0.1)',
    button: '0 2px 4px rgba(0, 0, 0, 0.1)',
    hover: '0 6px 12px rgba(0, 0, 0, 0.15)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    short: '0.15s ease-in-out',
    medium: '0.25s ease-in-out',
    long: '0.35s ease-in-out',
  },
};

// Create MUI theme
const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: tokens.colors.primary.main,
      dark: tokens.colors.primary.dark,
      light: tokens.colors.primary.light,
    },
    background: {
      default: tokens.colors.background.default,
      paper: tokens.colors.background.paper,
    },
    text: {
      primary: tokens.colors.text.primary,
      secondary: tokens.colors.text.secondary,
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
    h1: { fontSize: '2.5rem', fontWeight: 500 },
    h2: { fontSize: '2rem', fontWeight: 500 },
    h3: { fontSize: '1.75rem', fontWeight: 500 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
    button: { textTransform: 'none' }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#2b2b2b",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b6b6b",
            minHeight: 24,
          },
        },
      },
    },
  },
});

// Export both the MUI theme and styled-components theme
export { muiTheme, tokens as theme }; 