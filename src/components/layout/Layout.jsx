
// components/layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>© 2025 FEDEGÁN - Sistema de Gestión y Monitoreo</p>
      </footer>
    </div>
  );
};

export default Layout;