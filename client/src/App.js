import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import ErrorBoundary from './components/error/ErrorBoundary';

// Simple components
const Home = () => <div>Home Page</div>;
const Login = () => <div>Login Page</div>;

// Basic theme
const theme = {
  colors: {
    background: {
      main: '#121212'
    },
    text: {
      primary: '#ffffff'
    },
    status: {
      error: '#f44336'
    }
  },
  spacing: {
    md: '1rem'
  }
};

// Basic layout
const Layout = ({ children }) => (
  <div style={{ 
    minHeight: '100vh', 
    background: '#121212', 
    color: '#ffffff',
    padding: '20px'
  }}>
    {children}
  </div>
);

// Simple router
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Home />
      </Layout>
    )
  },
  {
    path: '/login',
    element: (
      <Layout>
        <Login />
      </Layout>
    )
  }
]);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider 
          router={router}
          fallback={<div>Loading...</div>}
        />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
