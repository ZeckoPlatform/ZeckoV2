export const theme = {
  colors: {
    // Modern gradient combinations
    primary: {
      main: '#00B4DB',
      gradient: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
      light: '#33C3E2',
      dark: '#006D93',
      text: '#FFFFFF'
    },
    secondary: {
      main: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF4B4B 100%)',
      light: '#FF8E8E',
      dark: '#E54848',
      text: '#FFFFFF'
    },
    background: {
      main: '#F8FAFC',
      paper: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      glass: 'rgba(255, 255, 255, 0.8)'
    },
    text: {
      primary: '#2D3748',
      secondary: '#4A5568',
      disabled: '#A0AEC0',
      hint: '#718096'
    },
    status: {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    },
    // Glass effect colors
    glass: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.18)',
      shadow: 'rgba(31, 38, 135, 0.07)'
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    round: '50%'
  },

  shadows: {
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    card: '0 4px 20px rgba(0, 0, 0, 0.05)',
    hover: '0 8px 26px rgba(0, 0, 0, 0.09)',
    button: '0 4px 14px 0 rgba(0, 180, 219, 0.39)'
  },

  typography: {
    fontFamily: {
      main: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      heading: "'Poppins', sans-serif"
    },
    weight: {
      light: 300,
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
      xxl: '1.5rem',
      h1: '2.5rem',
      h2: '2rem',
      h3: '1.75rem',
      h4: '1.5rem',
      h5: '1.25rem',
      h6: '1rem'
    }
  },

  transitions: {
    short: '0.15s ease-in-out',
    medium: '0.25s ease-in-out',
    long: '0.35s ease-in-out'
  },

  zIndex: {
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500
  }
}; 