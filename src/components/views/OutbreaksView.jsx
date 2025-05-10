import React, { useState } from 'react';
import Map from '../common/Map';
import Chart from '../common/Chart';
import { outbreaksData } from '../../data/mockData';

const OutbreaksView = () => {
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  const [filters, setFilters] = useState({
    disease: '',
    status: '',
    region: '',
    severity: ''
  });
  
  // Filtrar datos según los filtros aplicados
  const getFilteredData = () => {
    return outbreaksData.filter(outbreak => {
      // Filtro por enfermedad
      if (filters.disease && outbreak.diseaseType !== filters.disease) return false;
      
      // Filtro por estado
      if (filters.status && outbreak.status !== filters.status) return false;
      
      // Filtro por región
      if (filters.region && outbreak.region !== filters.region) return false;
      
      // Filtro por severidad
      if (filters.severity && outbreak.severity !== filters.severity) return false;
      
      return true;
    });
  };
  
  const filteredData = getFilteredData();
  
  // Obtener listas únicas para los filtros
  const diseases = [...new Set(outbreaksData.map(o => o.diseaseType))];
  const regions = [...new Set(outbreaksData.map(o => o.region))];
  
  // Manejador de cambio de filtros
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Resetear filtros
  const resetFilters = () => {
    setFilters({
      disease: '',
      status: '',
      region: '',
      severity: ''
    });
  };
  
  // Preparar datos para el mapa
  const getMapMarkers = () => {
    return filteredData.map(outbreak => ({
      ...outbreak,
      title: outbreak.diseaseType,
      description: `${outbreak.municipality}, ${outbreak.region} - ${outbreak.affectedAnimals} animales`,
      type: 'outbreak'
    }));
  };
  
  // Preparar datos para gráficos
  const getChartData = () => {
    // Datos por enfermedad
    const byDisease = filteredData.reduce((acc, curr) => {
      const diseaseType = curr.diseaseType;
      if (!acc[diseaseType]) acc[diseaseType] = 0;
      acc[diseaseType] += curr.affectedAnimals;
      return acc;
    }, {});
    
    // Datos por estado
    const byStatus = filteredData.reduce((acc, curr) => {
      const status = curr.status;
      if (!acc[status]) acc[status] = 0;
      acc[status] += 1;
      return acc;
    }, {});
    
    return {
      byDisease: Object.entries(byDisease).map(([name, value]) => ({ name, value })),
      byStatus: Object.entries(byStatus).map(([name, value]) => ({
        name: name === 'active' ? 'Activo' : name === 'controlled' ? 'Controlado' : 'Erradicado',
        value
      }))
    };
  };
  
  const chartData = getChartData();
  
  // Función para obtener una representación textual del estado
  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Activo';
      case 'controlled': return 'Controlado';
      case 'eradicated': return 'Erradicado';
      default: return status;
    }
  };
  
  return (
    <div className="outbreaks-view">
      <div className="view-header">
        <h2>Brotes Sanitarios</h2>
        <p className="description">
          Mapa interactivo de brotes sanitarios activos, controlados y erradicados.
        </p>
      </div>
      
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-row">
            <div className="filter-group">
              <label>Enfermedad:</label>
              <select 
                value={filters.disease}
                onChange={(e) => handleFilterChange('disease', e.target.value)}
              >
                <option value="">Todas</option>
                {diseases.map(disease => (
                  <option key={disease} value={disease}>{disease}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Estado:</label>
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="active">Activo</option>
                <option value="controlled">Controlado</option>
                <option value="eradicated">Erradicado</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Región:</label>
              <select 
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value="">Todas</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Severidad:</label>
              <select 
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            
            <button className="reset-btn" onClick={resetFilters}>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
      
      <div className="outbreak-summary">
        <div className="summary-item">
          <span className="summary-label">Total Brotes:</span>
          <span className="summary-value">{filteredData.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Activos:</span>
          <span className="summary-value">{filteredData.filter(o => o.status === 'active').length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Controlados:</span>
          <span className="summary-value">{filteredData.filter(o => o.status === 'controlled').length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Erradicados:</span>
          <span className="summary-value">{filteredData.filter(o => o.status === 'eradicated').length}</span>
        </div>
      </div>
      
      <div className="outbreak-main">
        <div className="map-section">
          <Map 
            markers={getMapMarkers()} 
            title="Mapa de Brotes Sanitarios"
          />
        </div>
        
        <div className="charts-section">
          <div className="chart-row">
            <Chart 
              type="pie"
              data={chartData.byDisease}
              title="Animales Afectados por Enfermedad"
            />
            <Chart 
              type="pie"
              data={chartData.byStatus}
              title="Distribución por Estado"
            />
          </div>
        </div>
      </div>
      
      <div className="outbreaks-list">
        <h3>Listado de Brotes</h3>
        <table className="outbreaks-table">
          <thead>
            <tr>
              <th>Enfermedad</th>
              <th>Región</th>
              <th>Municipio</th>
              <th>Estado</th>
              <th>Severidad</th>
              <th>Animales Afectados</th>
              <th>Detección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(outbreak => (
              <tr key={outbreak.id}>
                <td>{outbreak.diseaseType}</td>
                <td>{outbreak.region}</td>
                <td>{outbreak.municipality}</td>
                <td>
                  <span className={`status-badge ${outbreak.status}`}>
                    {getStatusText(outbreak.status)}
                  </span>
                </td>
                <td>{outbreak.severity}</td>
                <td>{outbreak.affectedAnimals}</td>
                <td>{new Date(outbreak.detectionDate).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="view-details-btn"
                    onClick={() => setSelectedOutbreak(outbreak)}
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Detalles del brote seleccionado */}
      {selectedOutbreak && (
        <div className="details-panel">
          <div className="details-header">
            <h3>Detalles del Brote - {selectedOutbreak.diseaseType}</h3>
            <button className="close-btn" onClick={() => setSelectedOutbreak(null)}>×</button>
          </div>
          
          <div className="details-content">
            <div className="details-status">
              <span className={`status-badge ${selectedOutbreak.status}`}>
                {getStatusText(selectedOutbreak.status)}
              </span>
              <span className={`severity-badge ${selectedOutbreak.severity}`}>
                Severidad: {selectedOutbreak.severity}
              </span>
            </div>
            
            <div className="details-row">
              <span className="label">Ubicación:</span>
              <span className="value">{selectedOutbreak.municipality}, {selectedOutbreak.region}</span>
            </div>
            <div className="details-row">
              <span className="label">Fecha de Detección:</span>
              <span className="value">{new Date(selectedOutbreak.detectionDate).toLocaleDateString()}</span>
            </div>
            <div className="details-row">
              <span className="label">Animales Afectados:</span>
              <span className="value">{selectedOutbreak.affectedAnimals}</span>
            </div>
            <div className="details-row">
              <span className="label">Técnico Responsable:</span>
              <span className="value">{selectedOutbreak.responsibleTechnician}</span>
            </div>
            
            <div className="details-section">
              <h4>Medidas Tomadas</h4>
              <p>{selectedOutbreak.measures}</p>
            </div>
            
            <div className="details-section">
              <h4>Evolución del Brote</h4>
              <table className="progress-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Nuevos Casos</th>
                    <th>Total Casos</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOutbreak.progress.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.date}</td>
                      <td>{entry.newCases}</td>
                      <td>{entry.totalCases}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {selectedOutbreak.status === 'active' && (
              <div className="details-actions">
                <button className="secondary-btn">Ver Protocolo</button>
                <button className="primary-btn">Actualizar Estado</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutbreaksView;