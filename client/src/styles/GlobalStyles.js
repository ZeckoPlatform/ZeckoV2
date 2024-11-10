import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${({ theme }) => theme.typography?.fontFamily?.primary || "'Inter', sans-serif"};
    background-color: ${({ theme }) => theme.colors?.background?.main || '#f5f5f5'};
    color: ${({ theme }) => theme.colors?.text?.primary || '#333333'};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

export default GlobalStyles; 