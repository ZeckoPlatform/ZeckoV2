import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from './styles/GlobalStyles';
import ErrorBoundary from './components/error/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import Layout from './components/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import ProductManagement from './components/admin/ProductManagement';
import AddProduct from './components/admin/products/AddProduct';
import EditProduct from './components/admin/products/EditProduct';

const theme = {
  colors: {
    primary: {
      main: '#81C784',
      dark: '#4CAF50',
      light: '#C8E6C9',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
      main: '#121212',
      light: '#1E1E1E'
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#BDBDBD'
    },
    border: {
      main: 'rgba(255, 255, 255, 0.1)'
    },
    status: {
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
      success: '#4caf50'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px'
  },
  transitions: {
    short: '0.15s ease-in-out',
    medium: '0.25s ease-in-out',
    long: '0.35s ease-in-out'
  },
  zIndex: {
    drawer: 1200,
    modal: 1300,
    tooltip: 1400
  }
};

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: theme.colors.primary.main,
    },
    background: {
      default: theme.colors.background.default,
      paper: theme.colors.background.paper,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'products',
        element: <ProductList />
      },
      {
        path: 'products/:id',
        element: <ProductDetails />
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: 'dashboard/products',
        element: <ProtectedRoute><Products /></ProtectedRoute>
      },
      {
        path: 'admin/products',
        element: <ProtectedRoute><ProductManagement /></ProtectedRoute>
      },
      {
        path: 'admin/products/add',
        element: <ProtectedRoute><AddProduct /></ProtectedRoute>
      },
      {
        path: 'admin/products/edit/:id',
        element: <ProtectedRoute><EditProduct /></ProtectedRoute>
      }
    ]
  }
]);

function App() {
  return (
    <ErrorBoundary>
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={muiTheme}>
          <AuthProvider>
            <NotificationProvider>
              <CssBaseline />
              <GlobalStyles />
              <RouterProvider 
                router={router}
                fallback={<div>Loading...</div>}
              />
              <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </NotificationProvider>
          </AuthProvider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
