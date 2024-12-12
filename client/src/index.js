import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider } from './contexts/ThemeContext';
import { muiTheme } from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import { router } from './routes';
import { ToastContainer } from 'react-toastify';
import GlobalStyles from './styles/GlobalStyles';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <MuiThemeProvider theme={muiTheme}>
          <GlobalStyles />
          <NotificationProvider>
            <AuthProvider>
              <ProductProvider>
                <CartProvider>
                  <RouterProvider router={router} />
                  <ToastContainer />
                </CartProvider>
              </ProductProvider>
            </AuthProvider>
          </NotificationProvider>
        </MuiThemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
