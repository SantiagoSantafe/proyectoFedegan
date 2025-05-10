// components/layout/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <h1>FEDEGÁN</h1>
        <span>Sistema de Monitoreo</span>
      </div>
      <ul className="nav-links">
        <li>
          <NavLink to="/movements" className={({ isActive }) => isActive ? 'active' : ''}>
            Movimiento de Ganado
          </NavLink>
        </li>
        <li>
          <NavLink to="/outbreaks" className={({ isActive }) => isActive ? 'active' : ''}>
            Brotes Sanitarios
          </NavLink>
        </li>
        <li>
          <NavLink to="/vaccinations" className={({ isActive }) => isActive ? 'active' : ''}>
            Jornadas de Vacunación
          </NavLink>
        </li>
      </ul>
      <div className="user-info">
        <span className="user-name">Líder FEDEGÁN</span>
        <button className="logout-btn">Cerrar Sesión</button>
      </div>
    </nav>
  );
};

export default Navbar;
