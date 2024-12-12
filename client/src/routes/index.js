import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Home from '../pages/Home';
import ProductList from '../pages/ProductList';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

const Routes = () => {
  return (
    <RouterRoutes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </RouterRoutes>
  );
};

export default Routes; 