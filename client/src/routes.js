import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostLead';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Notifications from './pages/Notifications';
import Shop from './pages/Shop';
import Services from './pages/Services';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LeadList from './pages/LeadList';
import LeadDetail from './pages/LeadDetail';
import BusinessDashboard from './pages/BusinessDashboard';
import LeadBoard from './pages/LeadBoard';
import BusinessProfile from './pages/BusinessProfile';
import VendorDashboard from './pages/VendorDashboard';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import Messaging from './pages/Messaging';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* User-specific Routes */}
      <Route path="/leads/*" element={
        <ProtectedRoute allowedTypes={['user']}>
          <Routes>
            <Route path="/" element={<LeadList />} />
            <Route path="/post" element={<PostJob />} />
            <Route path="/:id" element={<LeadDetail />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Business Routes */}
      <Route path="/business/*" element={
        <ProtectedRoute allowedTypes={['business']}>
          <Routes>
            <Route path="dashboard" element={<BusinessDashboard />} />
            <Route path="leads" element={<LeadBoard />} />
            <Route path="profile" element={<BusinessProfile />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Vendor Routes */}
      <Route path="/vendor/*" element={
        <ProtectedRoute allowedTypes={['vendor']}>
          <Routes>
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Shared Protected Routes */}
      <Route path="/messages" element={
        <ProtectedRoute allowedTypes={['user', 'business', 'vendor']}>
          <Messaging />
        </ProtectedRoute>
      } />
      
      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 