import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text.primary};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
      'Helvetica Neue', Arial, sans-serif;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  input, button, textarea, select {
    font: inherit;
  }
`;

export default GlobalStyles; 