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

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Products from './components/Dashboard/Products';
import ProductDetails from './pages/ProductDetails';
import ProductList from './pages/ProductList';

// Styled Components theme
const theme = {
  colors: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      text: '#ffffff',
      gradient: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828'
    },
    background: {
      paper: '#ffffff',
      main: '#f5f5f5',
      light: '#fafafa'
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999'
    },
    border: {
      main: '#e0e0e0'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px'
  },
  shadows: {
    card: '0 2px 4px rgba(0,0,0,0.1)'
  },
  typography: {
    size: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem'
    }
  }
};

// Material-UI theme
const muiTheme = createTheme({
  palette: {
    primary: {
      main: theme.colors.primary.main,
      light: theme.colors.primary.light,
      dark: theme.colors.primary.dark,
      contrastText: theme.colors.primary.text,
    },
    error: {
      main: theme.colors.error.main,
      light: theme.colors.error.light,
      dark: theme.colors.error.dark,
    },
    background: {
      default: theme.colors.background.main,
      paper: theme.colors.background.paper,
    },
    text: {
      primary: theme.colors.text.primary,
      secondary: theme.colors.text.secondary,
      disabled: theme.colors.text.disabled,
    },
  },
  spacing: (factor) => `${8 * factor}px`,
  shape: {
    borderRadius: parseInt(theme.borderRadius.md),
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/dashboard',
        element: <Dashboard />
      },
      {
        path: '/products',
        element: <Products />
      },
      {
        path: '/products/:id',
        element: <ProductDetails />
      },
      {
        path: '/product-list',
        element: <ProductList />
      }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MuiThemeProvider theme={muiTheme}>
          <StyledThemeProvider theme={theme}>
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
            />
          </StyledThemeProvider>
        </MuiThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
