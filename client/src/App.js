import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { ServiceCategoryProvider } from './contexts/ServiceCategoryContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/UI/LoadingSpinner';
import { AppProvider } from './context/AppContext';
import axios from 'axios';

// Import components
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Home from './pages/Home';
import UserProfile from './pages/Profile/UserProfile';
import PostLead from './pages/PostLead';
import DashboardProfile from './components/Dashboard/Profile';
import EditLead from './pages/EditLead';
import LeadDetail from './components/leads/LeadDetail';
import ProductDetails from './pages/ProductDetails';
import Products from './components/Dashboard/Products';

// Lazy load routes
const DashboardLazy = lazy(() => import('./pages/Dashboard'));
const ProfileLazy = lazy(() => import('./pages/Profile'));
const AuthLazy = lazy(() => import('./pages/Auth'));
const MessagesLazy = lazy(() => import('./pages/Messages'));
const LeadListing = lazy(() => import('./components/leads/LeadListing'));
const AuctionMonitor = lazy(() => import('./components/auction/AuctionMonitor'));

// Update axios configuration for API versioning
axios.interceptors.request.use((config) => {
  config.headers['Accept-Version'] = 'v1';
  if (!config.url?.startsWith('http')) {
    config.url = `/api/v1${config.url}`;
  }
  return config;
});

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
            <ErrorBoundary>
                <Router>
                    <ServiceCategoryProvider>
                        <ServiceProvider>
                            <AppProvider>
                                <Suspense fallback={<LoadingSpinner />}>
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
                                                    <DashboardLazy />
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

                                        {/* Profile routes */}
                                        <Route path="/profile" element={
                                            <PrivateRoute>
                                                <Layout>
                                                    <UserProfile />
                                                </Layout>
                                            </PrivateRoute>
                                        } />
                                        <Route path="/dashboard/profile" element={
                                            <PrivateRoute>
                                                <Layout>
                                                    <ProfileLazy />
                                                </Layout>
                                            </PrivateRoute>
                                        } />

                                        {/* Lead and Product routes */}
                                        <Route path="/lead/edit/:id" element={<EditLead />} />
                                        <Route path="/lead/:id" element={<LeadDetail />} />
                                        <Route path="/product/:id" element={<ProductDetails />} />
                                        <Route path="/products" element={<Products />} />

                                        {/* New routes */}
                                        <Route path="/leads" element={<LeadListing />} />
                                        <Route path="/auctions" element={<AuctionMonitor />} />

                                        {/* Catch all route */}
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </Suspense>
                            </AppProvider>
                        </ServiceProvider>
                    </ServiceCategoryProvider>
                </Router>
            </ErrorBoundary>
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
