import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import styled from 'styled-components';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/PrivateRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

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

function App() {
  useEffect(() => {
    const getClientIP = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        window.clientIP = response.data.ip;
      } catch (error) {
        console.error('Failed to get client IP:', error);
        window.clientIP = 'unknown';
      }
    };

    getClientIP();
  }, []);

  return (
    <AppContainer>
      <AuthProvider>
        <BrowserRouter>
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
                </Routes>
              </Suspense>
            </MainContent>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </AppContainer>
  );
}

export default App;
