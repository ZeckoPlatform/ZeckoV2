import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&display=swap');

  :root {
    /* Theme Colors - Light Mode */
    --primary-color: #4CAF50;
    --primary-color-dark: #388E3C;
    --primary-color-light: #A5D6A7;
    --secondary-color: #FFA726;
    --secondary-color-dark: #F57C00;
    --secondary-color-light: #FFE0B2;
    --background-color: #f5f5f5;
    --surface-color: #ffffff;
    --text-color: #333333;
    --text-color-light: #666666;
    --error-color: #f44336;
    --success-color: #4CAF50;
    --warning-color: #ff9800;
    --info-color: #2196f3;

    /* Alternative Color Themes */
    --theme-blue: #2196f3;
    --theme-purple: #9c27b0;
    --theme-orange: #ff5722;
    --theme-teal: #009688;

    /* Carousel Variables */
    --carousel-card-width: 300px;
    --carousel-gap: 20px;
    --carousel-padding: 20px;
    --carousel-button-size: 40px;
    --carousel-dot-size: 8px;
    
    /* Spacing & Layout */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* Effects */
    --box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    --box-shadow-hover: 0 4px 8px rgba(0,0,0,0.2);
    --transition-speed: 0.3s;
    --border-radius: 4px;
    --border-radius-lg: 8px;
  }

  /* Dark Mode */
  [data-theme='dark'] {
    --primary-color: #81C784;
    --primary-color-dark: #4CAF50;
    --primary-color-light: #C8E6C9;
    --secondary-color: #FFB74D;
    --background-color: #121212;
    --surface-color: #1E1E1E;
    --text-color: #E0E0E0;
    --text-color-light: #BDBDBD;
    --box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    --box-shadow-hover: 0 4px 8px rgba(0,0,0,0.4);
  }

  /* Animation Presets */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideLeft {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideRight {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  /* Enhanced Accessibility */
  :focus {
    outline: 3px solid var(--primary-color);
    outline-offset: 2px;
  }

  :focus:not(:focus-visible) {
    outline: none;
  }

  :focus-visible {
    outline: 3px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    :root {
      --primary-color: #006400;
      --text-color: #000000;
      --background-color: #ffffff;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.main};
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.main};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color var(--transition-speed),
                color var(--transition-speed);
  }

  /* Enhanced Button Styles */
  button {
    cursor: pointer;
    padding: 10px 20px;
    border: none;
    border-radius: var(--border-radius);
    background-color: var(--primary-color);
    color: white;
    font-size: 16px;
    transition: all var(--transition-speed);
    position: relative;
    overflow: hidden;

    &:hover {
      background-color: var(--primary-color-dark);
      transform: translateY(-2px);
      box-shadow: var(--box-shadow-hover);
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &.loading {
      pointer-events: none;
      opacity: 0.8;
    }

    /* Ripple effect */
    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
      background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
      background-repeat: no-repeat;
      background-position: 50%;
      transform: scale(10, 10);
      opacity: 0;
      transition: transform .5s, opacity 1s;
    }

    &:active::after {
      transform: scale(0, 0);
      opacity: .3;
      transition: 0s;
    }
  }

  /* Enhanced Link Styles */
  a {
    text-decoration: none;
    color: var(--primary-color);
    transition: all var(--transition-speed);
    position: relative;
    
    &:hover {
      color: var(--primary-color-dark);
    }

    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: -2px;
      left: 0;
      background-color: var(--primary-color);
      transform: scaleX(0);
      transform-origin: right;
      transition: transform var(--transition-speed);
    }

    &:hover::after {
      transform: scaleX(1);
      transform-origin: left;
    }
  }

  /* Utility Classes */
  .animate-fadeIn { animation: fadeIn var(--transition-speed) ease-in; }
  .animate-slideUp { animation: slideUp var(--transition-speed) ease-out; }
  .animate-slideDown { animation: slideDown var(--transition-speed) ease-out; }
  .animate-slideLeft { animation: slideLeft var(--transition-speed) ease-out; }
  .animate-slideRight { animation: slideRight var(--transition-speed) ease-out; }
  .animate-pulse { animation: pulse 2s infinite; }

  /* Keep existing styles... */
`;

export default GlobalStyle; 