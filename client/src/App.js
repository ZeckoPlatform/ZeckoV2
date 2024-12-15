import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';

// Import your pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import LeadDetail from './components/leads/LeadDetail';
import LeadList from './pages/LeadList';
import CreateLead from './pages/CreateLead';
import LeadDetails from './pages/LeadDetails';
import Layout from './components/Layout';

const theme = {
  colors: {
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    primary: {
      main: '#1976d2',
      dark: '#115293',
    },
    error: {
      main: '#f44336',
    },
    border: '#dddddd',
    background: {
      default: '#f5f5f5',
    }
  },
  borderRadius: {
    md: '8px',
  }
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="/leads/create" element={<CreateLead />} />
              <Route path="/leads/:id" element={<LeadDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
