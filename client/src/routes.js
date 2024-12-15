import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
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
import PrivateRoute from './components/routing/PrivateRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'shop', element: <Shop /> },
      { path: 'services', element: <Services /> },
      { 
        path: 'dashboard', 
        element: <PrivateRoute><Dashboard /></PrivateRoute>
      },
      {
        path: 'post-job',
        element: <PrivateRoute><PostJob /></PrivateRoute>
      }
    ]
  }
]); 