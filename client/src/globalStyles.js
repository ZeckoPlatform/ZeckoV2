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
  }

  a {
    text-decoration: none;
    color: var(--primary-color);
    
    &:hover {
      color: var(--primary-color-dark);
    }
  }
`;

export default GlobalStyle; 