import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --primary-color: #4CAF50;
    --primary-color-dark: #388E3C;
    --secondary-color: #FFA726;
    --background-color: #f5f5f5;
    --text-color: #333;
    --error-color: #f44336;
    --success-color: #4CAF50;
    --carousel-card-width: 300px;
    --carousel-gap: 20px;
    --carousel-padding: 20px;
    --carousel-button-size: 40px;
    --carousel-dot-size: 8px;
    --box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    --transition-speed: 0.3s;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button {
    cursor: pointer;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: var(--primary-color);
    color: white;
    font-size: 16px;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--primary-color-dark);
    }

    &:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
  }

  a {
    text-decoration: none;
    color: var(--primary-color);
    transition: color var(--transition-speed) ease;
    
    &:hover {
      color: var(--primary-color-dark);
    }
  }

  /* Carousel Animations */
  @keyframes slideIn {
    from { 
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Touch Device Optimizations */
  @media (hover: none) {
    .carousel-touch-scroll {
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x mandatory;
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    :root {
      --carousel-card-width: 250px;
      --carousel-gap: 15px;
      --carousel-padding: 10px;
      --carousel-button-size: 30px;
      --carousel-dot-size: 6px;
    }

    button {
      padding: 8px 16px;
      font-size: 14px;
    }
  }

  /* Loading States */
  .loading-shimmer {
    background: linear-gradient(
      90deg,
      #f0f0f0 25%,
      #e0e0e0 50%,
      #f0f0f0 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
  }

  /* Prevent Text Selection During Carousel Drag */
  .no-select {
    user-select: none;
    -webkit-user-select: none;
  }

  /* Smooth Scrolling */
  html {
    scroll-behavior: smooth;
  }
`;

export default GlobalStyle; 