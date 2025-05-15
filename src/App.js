
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import MovementView from './components/views/MovementView';
import OutbreaksView from './components/views/OutbreaksView';
import VaccinationView from './components/views/VaccinationView';
import './styles.css';

function App() {
  // Usando HashRouter en lugar de BrowserRouter para mejor compatibilidad con GitHub Pages
  // HashRouter usa URLs con hash (#) que funcionan sin configuración del servidor
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="movements" element={<MovementView />} />
          <Route path="outbreaks" element={<OutbreaksView />} />
          <Route path="vaccinations" element={<VaccinationView />} />
          <Route path="/" element={<Navigate to="/movements" replace />} />
          <Route path="*" element={<Navigate to="/movements" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;