import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import ErrorBoundary from './components/error/ErrorBoundary';

// Import your pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import LeadDetail from './components/leads/LeadDetail';
import LeadList from './pages/Lead';
import PostLead from './pages/PostLead';
import Layout from './components/Layout';
import Categories from './pages/services/Categories';
import ServiceRequest from './pages/services/ServiceRequest';

const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50',
      dark: '#388E3C',
      light: '#81C784',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#F44336',
      light: '#E57373',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F5F5F5',
        },
      },
    },
  },
});

// Convert MUI theme to styled-components theme
const styledTheme = {
  colors: {
    text: {
      primary: muiTheme.palette.text.primary,
      secondary: muiTheme.palette.text.secondary,
      disabled: muiTheme.palette.text.disabled,
    },
    primary: {
      main: muiTheme.palette.primary.main,
      dark: muiTheme.palette.primary.dark,
      light: muiTheme.palette.primary.light,
      contrastText: muiTheme.palette.primary.contrastText
    },
    status: {
      error: muiTheme.palette.error.main
    },
    background: {
      default: muiTheme.palette.background.default,
      paper: muiTheme.palette.background.paper,
      main: muiTheme.palette.background.paper
    }
  },
  borderRadius: {
    md: `${muiTheme.shape.borderRadius}px`,
  },
  input: {
    theme: {
      main: muiTheme.palette.primary.main
    }
  }
};

function App() {
  return (
    <ErrorBoundary>
      <MuiThemeProvider theme={muiTheme}>
        <StyledThemeProvider theme={styledTheme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Layout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="lead" element={<LeadList />} />
                  <Route path="lead/create" element={<PostLead />} />
                  <Route path="lead/:id" element={<LeadDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/services" element={<Categories />} />
                  <Route path="/service-request/:categoryId" element={<ServiceRequest />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </StyledThemeProvider>
      </MuiThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
