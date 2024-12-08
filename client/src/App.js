import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import { useNotification } from './contexts/NotificationContext';

function App() {
  const { showNotification } = useNotification();

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default App;
