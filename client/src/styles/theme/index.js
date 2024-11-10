import { css } from 'styled-components';

const baseTheme = {
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  typography: {
    fontFamily: {
      primary: "'Inter', sans-serif",
      secondary: "'Poppins', sans-serif"
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem'
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  transitions: {
    short: '150ms ease',
    medium: '300ms ease',
    long: '500ms ease'
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
};

export const lightTheme = {
  ...baseTheme,
  colors: {
    primary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)'
    },
    secondary: {
      main: '#FFA726',
      light: '#FFB74D',
      dark: '#F57C00',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #FFA726 0%, #F57C00 100%)'
    },
    background: {
      main: '#F8FAFC',
      paper: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      alt: '#F1F5F9'
    },
    text: {
      primary: '#1A2027',
      secondary: '#475569',
      disabled: '#94A3B8'
    },
    status: {
      success: '#4CAF50',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    glass: {
      background: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(255, 255, 255, 0.5)'
    }
  }
};

export const darkTheme = {
  ...baseTheme,
  colors: {
    primary: {
      main: '#81C784',
      light: '#A5D6A7',
      dark: '#4CAF50',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)'
    },
    secondary: {
      main: '#FFB74D',
      light: '#FFCC80',
      dark: '#FFA726',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)'
    },
    background: {
      main: '#121212',
      paper: '#1E1E1E',
      gradient: 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)',
      alt: '#2D2D2D'
    },
    text: {
      primary: '#E2E8F0',
      secondary: '#94A3B8',
      disabled: '#64748B'
    },
    status: {
      success: '#4CAF50',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    glass: {
      background: 'rgba(30, 30, 30, 0.8)',
      border: 'rgba(255, 255, 255, 0.1)'
    }
  }
};

export const mediaQueries = {
  xs: `@media (min-width: ${baseTheme.breakpoints.xs})`,
  sm: `@media (min-width: ${baseTheme.breakpoints.sm})`,
  md: `@media (min-width: ${baseTheme.breakpoints.md})`,
  lg: `@media (min-width: ${baseTheme.breakpoints.lg})`,
  xl: `@media (min-width: ${baseTheme.breakpoints.xl})`
};

export const globalStyles = css`
  html {
    box-sizing: border-box;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${baseTheme.typography.fontFamily.primary};
    line-height: ${baseTheme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background.main};
    transition: background-color ${baseTheme.transitions.medium},
                color ${baseTheme.transitions.medium};
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${baseTheme.typography.weight.bold};
    line-height: ${baseTheme.typography.lineHeight.tight};
    margin-bottom: ${baseTheme.spacing.md};
  }

  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    transition: color ${baseTheme.transitions.short};

    &:hover {
      color: ${({ theme }) => theme.colors.primary.dark};
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.primary.main}40;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`; 

export const theme = {
  light: {
    ...baseTheme,
    colors: lightTheme.colors,
    typography: baseTheme.typography
  },
  dark: {
    ...baseTheme,
    colors: darkTheme.colors,
    typography: baseTheme.typography
  }
};

// Export a default theme to avoid undefined theme issues
export default theme.light; 