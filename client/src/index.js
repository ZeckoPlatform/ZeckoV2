import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/error/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';

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
import Profile from './pages/Profile';
import AdminDashboard from './components/admin/AdminDashboard';
import ProductManagement from './components/admin/ProductManagement';
import AddProduct from './components/admin/products/AddProduct';
import EditProduct from './components/admin/products/EditProduct';
import SecuritySettings from './pages/SecuritySettings';
import UserActivityLog from './pages/UserActivityLog';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';
import OrderConfirmation from './pages/OrderConfirmation';

// Define routes with proper nesting
const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthProvider><App /></AuthProvider>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },
      { path: 'verify-email/:token', element: <EmailVerification /> },
      
      // Public routes
      { path: 'products', element: <ProductList /> },
      { path: 'products/:id', element: <ProductDetails /> },
      { path: 'directory', element: <BusinessDirectory /> },
      { path: 'jobs', element: <JobBoard /> },
      
      // Protected routes
      { 
        path: 'dashboard/*',
        element: <Dashboard />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'profile', element: <Profile /> },
          { path: 'security', element: <SecuritySettings /> },
          { path: 'activity', element: <UserActivityLog /> }
        ]
      },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'wishlist', element: <Wishlist /> },
      { path: 'order-confirmation/:orderId', element: <OrderConfirmation /> },
      
      // Admin routes
      {
        path: 'admin/*',
        element: <AdminDashboard />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'products', element: <ProductManagement /> },
          { path: 'products/add', element: <AddProduct /> },
          { path: 'products/edit/:id', element: <EditProduct /> }
        ]
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_normalizeFormMethod: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  },
  basename: process.env.PUBLIC_URL || ''
});

// Initialize future flags globally
if (typeof window !== 'undefined') {
  window.__reactRouterFutureFlags = router.future;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
