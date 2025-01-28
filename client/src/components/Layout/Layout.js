import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../Navigation';
import Footer from './Footer';

const Layout = () => {
  return (
    <div>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 