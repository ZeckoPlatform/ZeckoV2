import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { ServiceCategoryProvider } from './contexts/ServiceCategoryContext';

// Import components
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Home from './pages/Home';
import Profile from './components/Dashboard/Profile';
import UserProfile from './pages/UserProfile';
import PostLead from './pages/PostLead';
import DashboardProfile from './components/Dashboard/Profile';

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
    
    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Router>
                <ServiceCategoryProvider>
                    <ServiceProvider>
                        <Routes>
                            {/* Public routes */}
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
                            <Route path="/post-lead" element={
                                <PrivateRoute>
                                    <Layout>
                                        <PostLead />
                                    </Layout>
                                </PrivateRoute>
                            } />

                            {/* Main profile page route */}
                            <Route 
                                path="/profile" 
                                element={
                                    <PrivateRoute>
                                        <Layout>
                                            <UserProfile />
                                        </Layout>
                                    </PrivateRoute>
                                } 
                            />

                            {/* Dashboard profile route */}
                            <Route 
                                path="/dashboard/profile" 
                                element={
                                    <PrivateRoute>
                                        <Layout>
                                            <Profile />
                                        </Layout>
                                    </PrivateRoute>
                                } 
                            />

                            {/* Catch all route */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </ServiceProvider>
                </ServiceCategoryProvider>
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
