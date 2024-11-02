import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import styled from 'styled-components';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/PrivateRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initSocket } from './utils/socket.io';

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

console.log('Component Check:', {
  Home,
  ProductList,
  ProductDetails,
  BusinessDirectory,
  JobBoard,
  Dashboard,
  SecuritySettings
});

console.log('Component Types:', {
  BusinessDirectory: typeof BusinessDirectory,
  JobBoard: typeof JobBoard,
  Home: typeof Home,
  ProductList: typeof ProductList,
  ProductDetails: typeof ProductDetails,
  Cart: typeof Cart,
  Login: typeof Login,
  Register: typeof Register,
  Profile: typeof Profile,
  Checkout: typeof Checkout,
  Wishlist: typeof Wishlist,
  ChangePassword: typeof ChangePassword,
  OrderConfirmation: typeof OrderConfirmation,
  Shop: typeof Shop,
  SecuritySettings: typeof SecuritySettings
});

function App() {
  useEffect(() => {
    initSocket();
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
                  <Route 
                    path="/admin" 
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } 
                  >
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="products/add" element={<AddProduct />} />
                    <Route path="products/edit/:id" element={<EditProduct />} />
                  </Route>
                </Routes>
              </Suspense>
            </MainContent>
          </Layout>
          <ToastContainer />
        </BrowserRouter>
      </AuthProvider>
    </AppContainer>
  );
}

export default App;
