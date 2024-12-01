import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import App from '../App';
import ErrorBoundary from '../components/error/ErrorBoundary';
import { LoadingFallback } from '../components/common/LoadingFallback';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminRoute } from '../components/auth/AdminRoute';

// Import pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import EmailVerification from '../pages/EmailVerification';
import ProductList from '../pages/ProductList';
import ProductDetails from '../pages/ProductDetails';
import BusinessDirectory from '../pages/BusinessDirectory';
import JobBoard from '../pages/JobBoard';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Wishlist from '../pages/Wishlist';
import OrderConfirmation from '../pages/OrderConfirmation';
import Profile from '../pages/Profile';
import DashboardHome from '../pages/Dashboard/DashboardHome';
import Products from '../components/Dashboard/Products';
import Settings from '../components/Dashboard/Settings';
import DashboardStats from '../components/admin/DashboardStats';
import UserManagement from '../components/admin/UserManagement';
import OrderManagement from '../components/admin/OrderManagement';
import AdminSettings from '../components/admin/Settings';
import Dashboard from '../pages/Dashboard';

// Lazy loaded components
const Shop = React.lazy(() => import('../pages/Shop'));
const SecuritySettings = React.lazy(() => import('../pages/SecuritySettings'));
const UserActivityLog = React.lazy(() => import('../pages/UserActivityLog'));
const AdminDashboard = React.lazy(() => import('../components/admin/AdminDashboard'));
const ProductManagement = React.lazy(() => import('../components/admin/ProductManagement'));
const AddProduct = React.lazy(() => import('../components/admin/products/AddProduct'));
const EditProduct = React.lazy(() => import('../components/admin/products/EditProduct'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },
      { path: 'verify-email/:token', element: <EmailVerification /> },
      { path: 'products', element: <ProductList /> },
      { path: 'products/:id', element: <ProductDetails /> },
      { path: 'directory', element: <BusinessDirectory /> },
      { path: 'jobs', element: <JobBoard /> },
      { 
        path: 'shop', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Shop />
          </Suspense>
        ) 
      },

      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            ),
            children: [
              { index: true, element: <DashboardHome /> },
              { path: 'products', element: <Products /> },
              { path: 'profile', element: <Profile /> },
              { path: 'settings', element: <Settings /> }
            ]
          },
          { path: 'cart', element: <Cart /> },
          { path: 'checkout', element: <Checkout /> },
          { path: 'wishlist', element: <Wishlist /> },
          { path: 'profile', element: <Profile /> },
          {
            path: 'security-settings',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SecuritySettings />
              </Suspense>
            )
          },
          {
            path: 'activity-log',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <UserActivityLog />
              </Suspense>
            )
          },
          { path: 'order-confirmation/:orderId', element: <OrderConfirmation /> }
        ]
      },

      // Admin Routes
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            ),
            children: [
              { index: true, element: <DashboardStats /> },
              { path: 'users', element: <UserManagement /> },
              {
                path: 'products',
                children: [
                  { index: true, element: <ProductManagement /> },
                  { path: 'add', element: <AddProduct /> },
                  { path: 'edit/:id', element: <EditProduct /> }
                ]
              },
              { path: 'orders', element: <OrderManagement /> },
              { path: 'settings', element: <AdminSettings /> }
            ]
          }
        ]
      }
    ]
  }
]); 