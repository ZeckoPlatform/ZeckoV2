import { createTheme } from '@mui/material/styles';

// Define theme variables
const themeVariables = {
  colors: {
    primary: {
      main: '#4CAF50',
      dark: '#45a049',
      light: '#81C784',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
      dark: '#121212',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    }
  },
  transitions: {
    short: '0.15s',
    medium: '0.3s',
    long: '0.5s',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
  }
};

// Create MUI theme
const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: themeVariables.colors.primary.main,
      dark: themeVariables.colors.primary.dark,
      light: themeVariables.colors.primary.light,
    },
    background: {
      default: themeVariables.colors.background.default,
      paper: themeVariables.colors.background.paper,
    },
    text: {
      primary: themeVariables.colors.text.primary,
      secondary: themeVariables.colors.text.secondary,
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

export { muiTheme, themeVariables }; 