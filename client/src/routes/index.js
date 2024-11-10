import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/layout/Layout';
import { lazy, Suspense } from 'react';

// Lazy load components
const Home = lazy(() => import('../pages/Home'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
// ... other imports

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* ... other routes */}
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 