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
import { ServiceProvider } from './contexts/ServiceContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { PerformanceProvider } from './contexts/PerformanceContext';
import { SocketProvider } from './contexts/SocketContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import App from './App';
import { ToastContainer } from 'react-toastify';
import GlobalStyles from './styles/GlobalStyles';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

axios.defaults.baseURL = '/api/v1';

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />
          <GlobalStyles />
          <NotificationProvider>
            <AuthProvider>
              <OfflineProvider>
                <SocketProvider>
                  <ServiceCategoryProvider>
                    <ServiceProvider>
                      <ProductProvider>
                        <CartProvider>
                          <PerformanceProvider>
                            <App />
                            <ToastContainer />
                          </PerformanceProvider>
                        </CartProvider>
                      </ProductProvider>
                    </ServiceProvider>
                  </ServiceCategoryProvider>
                </SocketProvider>
              </OfflineProvider>
            </AuthProvider>
          </NotificationProvider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
