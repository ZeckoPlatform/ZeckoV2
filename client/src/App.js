import React from 'react';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from './components/error/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}

export default App;
