import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Notifications from './pages/Notifications';
import PrivateRoute from './components/PrivateRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { 
        path: 'dashboard/*', 
        element: <PrivateRoute><Dashboard /></PrivateRoute>,
        children: [
          { index: true, element: <Profile /> },
          { path: 'orders', element: <Orders /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'post-job', element: <PostJob /> }
        ]
      }
    ]
  }
]); 