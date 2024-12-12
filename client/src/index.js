import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import { router } from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <ThemeProvider>
            <ProductProvider>
              <CartProvider>
                <RouterProvider router={router} />
                <ToastContainer />
              </CartProvider>
            </ProductProvider>
          </ThemeProvider>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
