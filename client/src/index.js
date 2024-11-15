import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/error/ErrorBoundary';

// Set future flags
window.__reactRouterFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
  v7_normalizeFormMethod: true,
  v7_partialHydration: true,
  v7_skipActionErrorRevalidation: true,
  v7_fetcherPersist: true
};

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/*',
    element: <App />,
    errorElement: <ErrorBoundary />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
