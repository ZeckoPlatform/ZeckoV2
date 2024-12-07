import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import GlobalStyles from './styles/GlobalStyles';
import ErrorBoundary from './components/error/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import Layout from './components/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Dashboard from './pages/Dashboard';
import DashboardProducts from './components/Dashboard/Products';
import ProductManagement from './components/admin/ProductManagement';
import AddProduct from './components/admin/products/AddProduct';
import EditProduct from './components/admin/products/EditProduct';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
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
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: 'products',
        element: <ProductList />
      },
      {
        path: 'admin/products',
        element: <ProtectedRoute requiredRole="admin"><ProductManagement /></ProtectedRoute>
      }
    ]
  }
]);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <GlobalStyles />
            <RouterProvider router={router} />
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
              theme="dark"
            />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
