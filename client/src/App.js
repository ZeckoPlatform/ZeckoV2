import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from './styles/GlobalStyles';
import Layout from './components/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/error/ErrorBoundary';
import { withErrorBoundary } from './components/error/withErrorBoundary';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Products from './components/Dashboard/Products';
import ProductDetails from './pages/ProductDetails';
import ProductList from './pages/ProductList';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Define the theme
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

// Create MUI theme
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
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: 'dashboard/products',
        element: <ProtectedRoute><Products /></ProtectedRoute>
      },
      {
        path: 'dashboard/products/:id',
        element: <ProtectedRoute><ProductDetails /></ProtectedRoute>
      },
      {
        path: 'dashboard/product-list',
        element: <ProtectedRoute><ProductList /></ProtectedRoute>
      }
    ]
  }
]);

// Wrap the RouterProvider with error boundary
const SafeRouter = withErrorBoundary(
  ({ router }) => <RouterProvider router={router} />,
  { fallbackMessage: "Navigation error occurred. Please try again." }
);

function App() {
  return (
    <StyledThemeProvider theme={theme}>
      <MuiThemeProvider theme={muiTheme}>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </MuiThemeProvider>
    </StyledThemeProvider>
  );
}

export default App;
