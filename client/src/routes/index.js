import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import ErrorBoundary from '../components/error/ErrorBoundary';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Admin components
import AdminDashboard from '../components/admin/AdminDashboard';
import DashboardStats from '../components/admin/DashboardStats';
import Analytics from '../components/admin/Analytics';
import OrderManagement from '../components/admin/OrderManagement';
import ProductManagement from '../components/admin/ProductManagement';
import AddProduct from '../components/admin/products/AddProduct';
import EditProduct from '../components/admin/products/EditProduct';
import Settings from '../components/admin/Settings';
import UserManagement from '../components/admin/UserManagement';
import Dashboard from '../components/Dashboard/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
        children: [
          // Your dashboard routes here
        ]
      },
      // Add other routes as needed
    ]
  }
]); 