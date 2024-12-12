import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { muiTheme } from './styles/theme';
import ErrorBoundary from './components/error/ErrorBoundary';
import Routes from './routes';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={muiTheme}>
        <BrowserRouter>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <Routes />
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
