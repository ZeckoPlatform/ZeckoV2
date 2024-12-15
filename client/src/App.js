import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';

// Import your pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import LeadDetail from './components/leads/LeadDetail';
import LeadList from './pages/LeadList';
import PostLead from './pages/PostLead';
import Layout from './components/Layout';

const styledTheme = {
  colors: {
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    primary: {
      main: '#1976d2',
      dark: '#115293',
      light: '#4791db',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
    },
    grey: {
      main: '#9e9e9e',
      light: '#e0e0e0',
    },
    border: {
      main: '#dddddd',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    }
  },
  borderRadius: {
    md: '8px',
  }
};

const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      dark: '#115293',
      light: '#4791db',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
    },
    grey: {
      500: '#9e9e9e',
      200: '#e0e0e0',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={styledTheme}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="/leads/create" element={<PostLead />} />
                <Route path="/leads/:id" element={<LeadDetail />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
