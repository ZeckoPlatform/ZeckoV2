import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { muiTheme, theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import styled from 'styled-components';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/PrivateRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/error/ErrorBoundary';

// Import all pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import Checkout from './pages/Checkout';
import BusinessDirectory from './pages/BusinessDirectory';
import JobBoard from './pages/JobBoard';
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/Dashboard';
import ChangePassword from './pages/ChangePassword';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/Profile';
import AddressManagement from './pages/AddressManagement';
import BusinessProfile from './pages/BusinessProfile';

// Lazy loaded components
const Shop = React.lazy(() => import('./pages/Shop'));
const SecuritySettings = React.lazy(() => import('./pages/SecuritySettings'));
const UserActivityLog = React.lazy(() => import('./pages/UserActivityLog'));
const ProductManagement = React.lazy(() => import('./components/admin/ProductManagement'));
const AddProduct = React.lazy(() => import('./components/admin/products/AddProduct'));
const EditProduct = React.lazy(() => import('./components/admin/products/EditProduct'));

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

function App() {
  const location = useLocation();

  return (
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
        <AuthProvider>
          <AppContainer>
            <Layout>
              <MainContent>
                <ErrorBoundary key={location.pathname}>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/products/:id" element={<ProductDetails />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/directory" element={<BusinessDirectory />} />
                      <Route path="/jobs" element={<JobBoard />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                      <Route path="/verify-email/:token" element={<EmailVerification />} />

                      {/* Protected Routes */}
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                      <Route 
                        path="/security-settings" 
                        element={
                          <ProtectedRoute>
                            <Suspense fallback={<div>Loading...</div>}>
                              <SecuritySettings />
                            </Suspense>
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                      <Route 
                        path="/activity-log" 
                        element={
                          <ProtectedRoute>
                            <Suspense fallback={<div>Loading...</div>}>
                              <UserActivityLog />
                            </Suspense>
                          </ProtectedRoute>
                        } 
                      />

                      {/* Admin Routes */}
                      <Route 
                        path="/admin" 
                        element={
                          <AdminRoute>
                            <AdminDashboard />
                          </AdminRoute>
                        } 
                      >
                        <Route index element={<Navigate to="products" replace />} />
                        <Route 
                          path="products" 
                          element={
                            <Suspense fallback={<div>Loading...</div>}>
                              <ProductManagement />
                            </Suspense>
                          } 
                        />
                        <Route 
                          path="products/add" 
                          element={
                            <Suspense fallback={<div>Loading...</div>}>
                              <AddProduct />
                            </Suspense>
                          } 
                        />
                        <Route 
                          path="products/edit/:id" 
                          element={
                            <Suspense fallback={<div>Loading...</div>}>
                              <EditProduct />
                            </Suspense>
                          } 
                        />
                      </Route>
                      
                      {/* Standalone Product Management Route */}
                      <Route 
                        path="/manage-products" 
                        element={
                          <AdminRoute>
                            <Suspense fallback={<div>Loading...</div>}>
                              <ProductManagement />
                            </Suspense>
                          </AdminRoute>
                        } 
                      />

                      {/* Address Management Route */}
                      <Route path="/addresses" element={<AddressManagement />} />

                      {/* Business Profile Route */}
                      <Route path="/business/profile" element={<BusinessProfile />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </MainContent>
            </Layout>
          </AppContainer>
        </AuthProvider>
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
