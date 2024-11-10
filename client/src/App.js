import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Layout from './components/Layout';
import styled from 'styled-components';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/PrivateRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GlobalStyles from './styles/GlobalStyles';
import { NotificationProvider } from './context/NotificationContext';

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
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const ThemeToggle = styled.button`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.gradient};
  color: ${({ theme }) => theme.colors.primary.text};
  border: none;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 1000;
  
  &:hover {
    transform: scale(1.05);
  }
`;

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <GlobalStyles />
            <AppContainer>
              <Layout>
                <MainContent>
                  <Suspense fallback={<div>Loading...</div>}>
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
                </MainContent>
              </Layout>
              <ThemeToggle onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
              </ThemeToggle>
            </AppContainer>
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme={theme}
            />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
