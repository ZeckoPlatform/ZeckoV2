import React from 'react';
import ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { muiTheme } from './styles/muiTheme';
import { darkTheme } from './styles/theme/darkTheme';
import GlobalStyles from './styles/GlobalStyles';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={muiTheme}>
        <StyledThemeProvider theme={darkTheme}>
          <CssBaseline />
          <GlobalStyles />
          <App />
        </StyledThemeProvider>
      </MuiThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>
);
