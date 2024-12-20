import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
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
import Home from './pages/Home';

// PrivateRoute component
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

// AdminRoute component
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!user || user.accountType !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

function AppContent() {
    const { muiTheme } = useTheme();
    const { user } = useAuth();

    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Router>
                <ServiceProvider>
                    <Routes>
                        {/* Public routes with Layout */}
                        <Route path="/" element={
                            <Layout>
                                <Home />
                            </Layout>
                        } />
                        <Route path="/login" element={
                            user ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <Layout>
                                    <Login />
                                </Layout>
                            )
                        } />
                        <Route path="/register" element={
                            user ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <Layout>
                                    <Register />
                                </Layout>
                            )
                        } />

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

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </ServiceProvider>
            </Router>
        </MuiThemeProvider>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
