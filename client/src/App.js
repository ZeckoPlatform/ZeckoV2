import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import theme from './styles/theme';
import Layout from './components/Layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AdminRoute from './components/PrivateRoute';
import {
  Home,
  Login,
  Register,
  Dashboard,
  Products,
  Services,
  Profile,
  Orders
} from './pages';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="products" element={<Products />} />
              <Route path="services" element={<Services />} />
              
              {/* Protected Routes */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
