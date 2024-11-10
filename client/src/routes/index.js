import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminRoute from '../components/auth/AdminRoute';
import Layout from '../components/layout/Layout';
import * as Pages from './RouteConfig';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Pages.Home />} />
        <Route path="shop" element={<Pages.Shop />} />
        <Route path="product/:id" element={<Pages.ProductDetails />} />
        <Route path="cart" element={<Pages.Cart />} />
        
        {/* Auth Routes */}
        <Route path="login" element={<Pages.Login />} />
        <Route path="register" element={<Pages.Register />} />
        <Route path="forgot-password" element={<Pages.ForgotPassword />} />
        <Route path="reset-password" element={<Pages.ResetPassword />} />
        <Route path="verify-email" element={<Pages.EmailVerification />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Pages.Checkout />} />
          <Route path="order-confirmation" element={<Pages.OrderConfirmation />} />
          
          {/* User Dashboard */}
          <Route path="dashboard">
            <Route index element={<Pages.Dashboard />} />
            <Route path="profile" element={<Pages.Profile />} />
            <Route path="orders" element={<Pages.Orders />} />
            <Route path="wishlist" element={<Pages.Wishlist />} />
            <Route path="addresses" element={<Pages.AddressBook />} />
            <Route path="payment-methods" element={<Pages.PaymentMethods />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="admin" element={<AdminRoute />}>
          <Route index element={<Pages.AdminDashboard />} />
          <Route path="products" element={<Pages.ProductManagement />} />
          <Route path="orders" element={<Pages.OrderManagement />} />
          <Route path="users" element={<Pages.UserManagement />} />
          <Route path="analytics" element={<Pages.Analytics />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 