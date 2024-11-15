import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/error/ErrorBoundary';
import App from './App';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render with error handling
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
