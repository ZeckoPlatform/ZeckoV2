import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/error/ErrorBoundary';
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
import Shop from '../pages/Shop';
import Dashboard from '../pages/Dashboard';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Wishlist from '../pages/Wishlist';
import Profile from '../pages/Profile';
import SecuritySettings from '../pages/SecuritySettings';
import UserActivityLog from '../pages/UserActivityLog';
import OrderConfirmation from '../pages/OrderConfirmation';
import AdminDashboard from '../pages/admin/AdminDashboard';
import DashboardStats from '../pages/admin/DashboardStats';
import UserManagement from '../pages/admin/UserManagement';
import ProductManagement from '../pages/admin/ProductManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import AdminSettings from '../pages/admin/AdminSettings';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminRoute } from '../components/auth/AdminRoute';
import LoadingFallback from '../components/common/LoadingFallback';

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
          <React.Suspense fallback={<LoadingFallback />}>
            <Shop />
          </React.Suspense>
        )
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard/*',
            element: <Dashboard />
          },
          { path: 'cart', element: <Cart /> },
          { path: 'checkout', element: <Checkout /> },
          { path: 'wishlist', element: <Wishlist /> },
          { path: 'profile', element: <Profile /> },
          { path: 'security-settings', element: <SecuritySettings /> },
          { path: 'activity-log', element: <UserActivityLog /> },
          { path: 'order-confirmation/:orderId', element: <OrderConfirmation /> }
        ]
      },
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            element: <AdminDashboard />,
            children: [
              { index: true, element: <DashboardStats /> },
              { path: 'users', element: <UserManagement /> },
              { path: 'products', element: <ProductManagement /> },
              { path: 'orders', element: <OrderManagement /> },
              { path: 'settings', element: <AdminSettings /> }
            ]
          }
        ]
      }
    ]
  }
]); 