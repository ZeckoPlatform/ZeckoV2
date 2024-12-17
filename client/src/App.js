import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
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

function AppContent() {
  const { theme, muiTheme } = useTheme();

  return (
    <MuiThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={theme}>
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
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
