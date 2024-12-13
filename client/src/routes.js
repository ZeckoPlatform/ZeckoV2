import { createBrowserRouter, Outlet } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation';
import PostJob from './pages/PostJob';

// Wrapper component to include Navigation in all routes
const Layout = () => {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Home />
          },
          {
            path: 'login',
            element: <Login />
          },
          {
            path: 'register',
            element: <Register />
          },
          {
            path: 'dashboard',
            element: (
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            )
          },
          {
            path: 'post-job',
            element: (
              <PrivateRoute>
                <PostJob />
              </PrivateRoute>
            )
          }
        ]
      }
    ]
  }
]); 