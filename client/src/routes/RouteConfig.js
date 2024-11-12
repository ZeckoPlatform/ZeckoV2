import React, { lazy } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy loaded components with custom loading boundaries
const lazyLoad = (importFunc) => {
  const Component = lazy(importFunc);
  return (props) => (
    <React.Suspense fallback={<LoadingSpinner />}>
      <Component {...props} />
    </React.Suspense>
  );
};

// Auth Pages
export const Login = lazyLoad(() => import('../pages/auth/Login'));
export const Register = lazyLoad(() => import('../pages/auth/Register'));
export const ForgotPassword = lazyLoad(() => import('../pages/auth/ForgotPassword'));
export const ResetPassword = lazyLoad(() => import('../pages/auth/ResetPassword'));
export const EmailVerification = lazyLoad(() => import('../pages/auth/EmailVerification'));

// Main Pages
export const Home = lazyLoad(() => import('../pages/Home'));
export const Shop = lazyLoad(() => import('../pages/Shop'));
export const ProductDetails = lazyLoad(() => import('../pages/ProductDetails'));
export const Cart = lazyLoad(() => import('../pages/Cart'));
export const Checkout = lazyLoad(() => import('../pages/Checkout'));
export const OrderConfirmation = lazyLoad(() => import('../pages/OrderConfirmation'));

// User Dashboard
export const Dashboard = lazyLoad(() => import('../pages/Dashboard/Dashboard'));
export const Profile = lazyLoad(() => import('../pages/Dashboard/Profile'));
export const Orders = lazyLoad(() => import('../pages/Dashboard/Orders'));
export const Wishlist = lazyLoad(() => import('../pages/dashboard/Wishlist'));
export const AddressBook = lazyLoad(() => import('../pages/dashboard/AddressBook'));
export const PaymentMethods = lazyLoad(() => import('../pages/dashboard/PaymentMethods'));

// Admin Dashboard
export const AdminDashboard = lazyLoad(() => import('../pages/admin/Dashboard'));
export const ProductManagement = lazyLoad(() => import('../pages/admin/ProductManagement'));
export const OrderManagement = lazyLoad(() => import('../pages/admin/OrderManagement'));
export const UserManagement = lazyLoad(() => import('../pages/admin/UserManagement'));
export const Analytics = lazyLoad(() => import('../pages/admin/Analytics')); 