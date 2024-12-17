import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { theme, muiTheme } from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import { ServiceCategoryProvider } from './contexts/ServiceCategoryContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import App from './App';
import { ToastContainer } from 'react-toastify';
import GlobalStyles from './styles/GlobalStyles';
import 'react-toastify/dist/ReactToastify.css';
import { ServiceProvider } from './contexts/ServiceContext';

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />
          <GlobalStyles />
          <NotificationProvider>
            <AuthProvider>
              <ServiceProvider>
                <App />
                <ToastContainer />
              </ServiceProvider>
            </AuthProvider>
          </NotificationProvider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
