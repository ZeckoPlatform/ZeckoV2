import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Create ErrorBoundary component
const ErrorBoundary = ({ children }) => {
  return (
    <div className="error-boundary">
      <h1>Oops! Something went wrong.</h1>
      <p>Please try refreshing the page or contact support if the problem persists.</p>
    </div>
  );
};

// Define routes with error boundaries
const routes = [
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'dashboard/*',
        element: <Dashboard />,
        errorElement: <ErrorBoundary />
      },
      {
        path: 'login',
        element: <Login />,
        errorElement: <ErrorBoundary />
      },
      {
        path: 'register',
        element: <Register />,
        errorElement: <ErrorBoundary />
      }
    ]
  }
];

// Create router with all future flags
const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
