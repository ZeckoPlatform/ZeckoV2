import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/error/ErrorBoundary';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
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
        path: 'admin',
        element: <AdminDashboard />,
        children: [
          {
            index: true,
            element: <DashboardStats />
          },
          {
            path: 'analytics',
            element: <Analytics />
          },
          {
            path: 'orders',
            element: <OrderManagement />
          },
          {
            path: 'products',
            element: <ProductManagement />
          },
          {
            path: 'products/add',
            element: <AddProduct />
          },
          {
            path: 'products/edit/:id',
            element: <EditProduct />
          },
          {
            path: 'settings',
            element: <Settings />
          },
          {
            path: 'users',
            element: <UserManagement />
          }
        ]
      }
    ]
  }
]); 