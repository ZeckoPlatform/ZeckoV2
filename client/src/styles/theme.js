export const theme = {
  colors: {
    primary: {
      main: '#007AFF',
      light: '#4DA2FF',
      dark: '#0055B3',
      gradient: 'linear-gradient(45deg, #007AFF, #4DA2FF)',
      text: '#FFFFFF'
    },
    secondary: {
      main: '#5856D6',
      light: '#7A79E0',
      dark: '#3E3C96',
      text: '#FFFFFF'
    },
    background: {
      main: '#FFFFFF',
      alt: '#F5F5F5',
      dark: '#1C1C1E'
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      disabled: '#999999'
    },
    status: {
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FF9500',
      info: '#5856D6'
    },
    border: {
      light: '#E5E5EA',
      main: '#C7C7CC',
      dark: '#8E8E93'
    }
  },
  typography: {
    fontFamily: {
      main: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace"
    },
    size: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    },
    weight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.05)'
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out'
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1600,
    tooltip: 1700
  }
}; 