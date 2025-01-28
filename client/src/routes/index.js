import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../App';
import Layout from '../components/Layout/Layout';
import Home from '../pages/Home';
import ProductList from '../pages/ProductList';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Jobs from '../pages/Lead';
import Contractors from '../pages/Contractors';
import NotFound from '../pages/NotFound';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import Dashboard from '../pages/Dashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="contractors" element={<Contractors />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="dashboard" element={<ProtectedRoute allowedTypes={['user', 'admin', 'vendor', 'contractor']}>
          <Dashboard />
        </ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
} 
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Home />
          },
          {
            path: 'jobs',
            element: <Jobs />
          },
          {
            path: 'contractors',
            element: <Contractors />
          },
          {
            path: 'products',
            element: <ProductList />
          },
          {
            path: 'products/:id',
            element: <ProductDetails />
          },
          {
            path: 'cart',
            element: <Cart />
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
            path: 'profile',
            element: <ProtectedRoute><Profile /></ProtectedRoute>
          },
          {
            path: '*',
            element: <NotFound />
          }
        ]
      }
    ]
  }
]); 