import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { muiTheme } from './styles/theme';
import Layout from './components/Layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/error/ErrorBoundary';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Profile from './pages/Profile';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={muiTheme}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="products" element={<ProductList />} />
                <Route path="cart" element={<Cart />} />
                
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
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
