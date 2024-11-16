import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/error/ErrorBoundary';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import Dashboard from './pages/Dashboard';

// Define routes with proper nesting
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <ProductList /> },
      { 
        path: 'dashboard/*',  // Changed to handle nested routes
        element: <Dashboard />,
        children: [
          { index: true, element: <Dashboard /> }
        ]
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_normalizeFormMethod: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  },
  basename: process.env.PUBLIC_URL || ''
});

// Initialize future flags globally
if (typeof window !== 'undefined') {
  window.__reactRouterFutureFlags = router.future;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
