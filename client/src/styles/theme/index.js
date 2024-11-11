import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

const baseTheme = {
  typography: {
    fontFamily: {
      primary: "'Roboto', sans-serif",
      secondary: "'Open Sans', sans-serif",
    },
    lineHeight: {
      normal: 1.5,
      heading: 1.2,
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
};

export const themes = {
  light: { ...baseTheme, ...lightTheme },
  dark: { ...baseTheme, ...darkTheme },
};

export default themes; 