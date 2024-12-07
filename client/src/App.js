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
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Dashboard from './pages/Dashboard';
import DashboardProducts from './components/Dashboard/Products';
import ProductManagement from './components/admin/ProductManagement';
import AddProduct from './components/admin/products/AddProduct';
import EditProduct from './components/admin/products/EditProduct';

const theme = {
  background: {
    default: '#121212',
    paper: '#1E1E1E',
    main: '#121212',
    light: '#1E1E1E'
  },
  colors: {
    primary: {
      main: '#81C784',
      dark: '#4CAF50',
      light: '#C8E6C9',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#BDBDBD',
      disabled: '#757575'
    },
    border: {
      main: 'rgba(255, 255, 255, 0.1)'
    },
    status: {
      error: '#f44336',
      success: '#4caf50'
    }
  }
};

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: theme.colors.primary.main,
      dark: theme.colors.primary.dark,
      light: theme.colors.primary.light,
    },
    background: {
      default: theme.background.default,
      paper: theme.background.paper,
    },
    text: {
      primary: theme.colors.text.primary,
      secondary: theme.colors.text.secondary,
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
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: 'products',
        element: <ProductList />
      },
      {
        path: 'admin/products',
        element: <ProtectedRoute requiredRole="admin"><ProductManagement /></ProtectedRoute>
      }
    ]
  }
]);

function App() {
  return (
    <ErrorBoundary>
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={muiTheme}>
          <NotificationProvider>
            <AuthProvider>
              <CssBaseline />
              <GlobalStyles />
              <RouterProvider router={router} />
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
                theme="dark"
              />
            </AuthProvider>
          </NotificationProvider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
