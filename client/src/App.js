import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ServiceProvider } from './contexts/ServiceContext';

// Import components
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';

// PrivateRoute component
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// AdminRoute component
const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user || user.accountType !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function AppContent() {
    const { theme, muiTheme } = useTheme();

    return (
        <MuiThemeProvider theme={muiTheme}>
            <StyledThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <AuthProvider>
                        <ServiceProvider>
                            <Routes>
                                {/* Public routes */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                {/* Protected routes */}
                                <Route path="/dashboard" element={
                                    <PrivateRoute>
                                        <Layout>
                                            <Dashboard />
                                        </Layout>
                                    </PrivateRoute>
                                } />

                                {/* Admin routes */}
                                <Route path="/admin" element={
                                    <AdminRoute>
                                        <Layout>
                                            <AdminDashboard />
                                        </Layout>
                                    </AdminRoute>
                                } />

                                {/* Root redirect */}
                                <Route path="/" element={
                                    <PrivateRoute>
                                        <Navigate to="/dashboard" replace />
                                    </PrivateRoute>
                                } />

                                {/* Catch all route */}
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </ServiceProvider>
                    </AuthProvider>
                </Router>
            </StyledThemeProvider>
        </MuiThemeProvider>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;
