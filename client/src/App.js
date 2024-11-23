import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { muiTheme, theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import styled from 'styled-components';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import all pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import BusinessDirectory from './pages/BusinessDirectory';
import JobBoard from './pages/JobBoard';
import Wishlist from './pages/Wishlist';
import ChangePassword from './pages/ChangePassword';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/Profile';
import AddressManagement from './pages/AddressManagement';
import BusinessProfile from './pages/BusinessProfile';
import AdminDashboard from './components/admin/AdminDashboard';

// Lazy loaded components
const Shop = React.lazy(() => import('./pages/Shop'));
const SecuritySettings = React.lazy(() => import('./pages/SecuritySettings'));
const UserActivityLog = React.lazy(() => import('./pages/UserActivityLog'));
const ProductManagement = React.lazy(() => import('./components/admin/ProductManagement'));
const AddProduct = React.lazy(() => import('./components/admin/products/AddProduct'));
const EditProduct = React.lazy(() => import('./components/admin/products/EditProduct'));

// Loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    Loading...
  </div>
);

// Styled components
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Add navigation guard
  React.useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      console.log('Already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location]);

  return (
    <AuthProvider>
      <MuiThemeProvider theme={muiTheme}>
        <StyledThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles />
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
          <AppContainer>
            <Layout>
              <MainContent>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={
                      isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
                    } />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/directory" element={<BusinessDirectory />} />
                    <Route path="/jobs" element={<JobBoard />} />
                    <Route path="/shop" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Shop />
                      </Suspense>
                    } />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/verify-email/:token" element={<EmailVerification />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <Dashboard />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                    <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                    <Route path="/security-settings" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <SecuritySettings />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                    <Route path="/activity-log" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <UserActivityLog />
                        </Suspense>
                      </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin/*" element={
                      <AdminRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <Routes>
                            <Route index element={<AdminDashboard />} />
                            <Route path="products" element={<ProductManagement />} />
                            <Route path="products/add" element={<AddProduct />} />
                            <Route path="products/edit/:id" element={<EditProduct />} />
                          </Routes>
                        </Suspense>
                      </AdminRoute>
                    } />

                    {/* Catch-all Route */}
                    <Route path="*" element={
                      <Navigate to="/" replace state={{ from: location }} />
                    } />
                  </Routes>
                </Suspense>
              </MainContent>
            </Layout>
          </AppContainer>
        </StyledThemeProvider>
      </MuiThemeProvider>
    </AuthProvider>
  );
}

export default App;
