import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Contractors from './pages/Contractors';
import { useNotification } from './contexts/NotificationContext';

function App() {
  const { showNotification } = useNotification();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/contractors" element={<Contractors />} />
      {/* Add other routes */}
    </Routes>
  );
}

export default App;
