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

// Define the styled-components theme
const theme = {
  colors: {
    primary: {
      main: '#81C784',
      dark: '#4CAF50',
      light: '#C8E6C9',
      text: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f'
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
      main: '#121212',
      light: '#1E1E1E'
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#BDBDBD',
      disabled: 'rgba(255, 255, 255, 0.38)',
    },
    border: {
      main: 'rgba(255, 255, 255, 0.2)'
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
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem'
  },
  shadows: {
    card: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  typography: {
    size: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem'
    }
  }
};

// Create MUI theme
const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: theme.colors.primary.main,
      dark: theme.colors.primary.dark,
      light: theme.colors.primary.light,
    },
    background: {
      default: theme.colors.background.default,
      paper: theme.colors.background.paper,
    },
    text: {
      primary: theme.colors.text.primary,
      secondary: theme.colors.text.secondary,
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#2b2b2b",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b6b6b",
            minHeight: 24,
          },
        },
      },
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/products', element: <Products /> },
      { path: '/products/:id', element: <ProductDetails /> },
      { path: '/product-list', element: <ProductList /> }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <StyledThemeProvider theme={theme}>
          <MuiThemeProvider theme={muiTheme}>
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
          </MuiThemeProvider>
        </StyledThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
