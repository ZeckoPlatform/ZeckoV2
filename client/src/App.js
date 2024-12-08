import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Contractors from './pages/Contractors';
import NotFound from './pages/NotFound';
import { useNotification } from './contexts/NotificationContext';

function App() {
  const { showNotification } = useNotification();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="jobs/*" element={<Jobs />} />
        <Route path="contractors/*" element={<Contractors />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
