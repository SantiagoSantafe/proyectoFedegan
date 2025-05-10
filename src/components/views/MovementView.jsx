import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Map from '../common/Map';
import Chart from '../common/Chart';
import { movementsData } from '../../data/mockData';

const MovementView = () => {
  const [activeTab, setActiveTab] = useState('table');
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    country: '',
    dateStart: '',
    dateEnd: '',
    hasAlert: false
  });
  
  // Filtrar datos según los filtros aplicados
  const getFilteredData = () => {
    return movementsData.filter(movement => {
      // Filtro por tipo
      if (filters.type && movement.type !== filters.type) return false;
      
      // Filtro por país
      if (filters.country && movement.country !== filters.country) return false;
      
      // Filtro por fecha inicio
      if (filters.dateStart) {
        const startDate = new Date(filters.dateStart);
        const movementDate = new Date(movement.dateOfMovement);
        if (movementDate < startDate) return false;
      }
      
      // Filtro por fecha fin
      if (filters.dateEnd) {
        const endDate = new Date(filters.dateEnd);
        endDate.setHours(23, 59, 59);
        const movementDate = new Date(movement.dateOfMovement);
        if (movementDate > endDate) return false;
      }
      
      // Filtro por alertas
      if (filters.hasAlert && !movement.hasAlert) return false;
      
      return true;
    });
  };
  
  const filteredData = getFilteredData();
  
  // Columnas para la tabla
  const columns = [
    { 
      header: 'Fecha', 
      accessor: 'dateOfMovement', 
      format: (value) => new Date(value).toLocaleDateString() 
    },
    { 
      header: 'Tipo', 
      accessor: 'type', 
      format: (value) => value === 'import' ? 'Importación' : 'Exportación' 
    },
    { header: 'País', accessor: 'country' },
    { header: 'Cantidad', accessor: 'animalCount' },
    { header: 'Tipo Animal', accessor: 'animalType' },
    { header: 'Propósito', accessor: 'purpose' },
    { 
      header: 'Alerta', 
      accessor: 'hasAlert', 
      format: (value) => value ? '⚠️' : '✓' 
    }
  ];
  
  // Preparar datos para el mapa
  const getMapMarkers = () => {
    const markers = [];
    
    filteredData.forEach(movement => {
      if (movement.coordinates) {
        // Punto de origen
        if (movement.coordinates.origin) {
          markers.push({
            id: `origin-${movement.id}`,
            title: `${movement.type === 'import' ? 'Origen' : 'Salida'}: ${movement.country}`,
            description: `${movement.animalCount} ${movement.animalType}`,
            coordinates: movement.coordinates.origin,
            type: 'origin'
          });
        }
        
        // Punto de destino
        if (movement.coordinates.destination) {
          markers.push({
            id: `destination-${movement.id}`,
            title: `${movement.type === 'import' ? 'Destino' : 'Destino'}: ${movement.type === 'import' ? movement.destination : movement.country}`,
            description: `${movement.animalCount} ${movement.animalType}`,
            coordinates: movement.coordinates.destination,
            type: 'destination'
          });
        }
      }
    });
    
    return markers;
  };
  
  // Preparar datos para gráficos
  const getChartData = () => {
    // Datos por país
    const byCountry = filteredData.reduce((acc, curr) => {
      const country = curr.country;
      if (!acc[country]) acc[country] = { imports: 0, exports: 0 };
      
      if (curr.type === 'import') {
        acc[country].imports += curr.animalCount;
      } else {
        acc[country].exports += curr.animalCount;
      }
      
      return acc;
    }, {});
    
    // Convertir a formato para gráficos
    return Object.entries(byCountry).map(([name, values]) => ({
      name,
      value: values.imports + values.exports
    }));
  };
  
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
      type: '',
      country: '',
      dateStart: '',
      dateEnd: '',
      hasAlert: false
    });
  };
  
  // Obtener la lista única de países para el filtro
  const countries = [...new Set(movementsData.map(m => m.country))];
  
  return (
    <div className="movement-view">
      <div className="view-header">
        <h2>Movimiento de Ganado</h2>
        <p className="description">
          Monitoreo de importaciones y exportaciones de ganado, con visualización de alertas sanitarias.
        </p>
      </div>
      
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-row">
            <div className="filter-group">
              <label>Tipo:</label>
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="import">Importación</option>
                <option value="export">Exportación</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>País:</label>
              <select 
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <option value="">Todos</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Desde:</label>
              <input 
                type="date" 
                value={filters.dateStart}
                onChange={(e) => handleFilterChange('dateStart', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Hasta:</label>
              <input 
                type="date" 
                value={filters.dateEnd}
                onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group checkbox">
              <input 
                type="checkbox"
                id="alertFilter"
                checked={filters.hasAlert}
                onChange={(e) => handleFilterChange('hasAlert', e.target.checked)}
              />
              <label htmlFor="alertFilter">Solo con alertas</label>
            </div>
            
            <button className="reset-btn" onClick={resetFilters}>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
      
      {/* Alerta si hay movimientos con alerta */}
      {filters.hasAlert && filteredData.some(m => m.hasAlert) && (
        <div className="alerts-panel">
          <h3>⚠️ Alertas Activas</h3>
          <ul>
            {filteredData
              .filter(m => m.hasAlert)
              .map(movement => (
                <li key={movement.id}>
                  <strong>{movement.documentNumber} - {movement.country}</strong>: {movement.alertReason}
                </li>
              ))
            }
          </ul>
        </div>
      )}
      
      <div className="view-tabs">
        <button 
          className={activeTab === 'table' ? 'active' : ''}
          onClick={() => setActiveTab('table')}
        >
          Tabla
        </button>
        <button 
          className={activeTab === 'map' ? 'active' : ''}
          onClick={() => setActiveTab('map')}
        >
          Mapa
        </button>
        <button 
          className={activeTab === 'chart' ? 'active' : ''}
          onClick={() => setActiveTab('chart')}
        >
          Gráficos
        </button>
      </div>
      
      <div className="view-content">
        {activeTab === 'table' && (
          <DataTable 
            data={filteredData}
            columns={columns}
            onRowClick={setSelectedMovement}
          />
        )}
        
        {activeTab === 'map' && (
          <Map 
            markers={getMapMarkers()} 
            title="Mapa de Movimientos de Ganado"
          />
        )}
        
        {activeTab === 'chart' && (
          <Chart 
            type="pie"
            data={getChartData()}
            title="Movimientos por País (Total Animales)"
          />
        )}
      </div>
      
      {/* Detalles del movimiento seleccionado */}
      {selectedMovement && (
        <div className="details-panel">
          <div className="details-header">
            <h3>Detalles del Movimiento</h3>
            <button className="close-btn" onClick={() => setSelectedMovement(null)}>×</button>
          </div>
          
          <div className="details-content">
            <div className="details-row">
              <span className="label">Tipo:</span>
              <span className="value">{selectedMovement.type === 'import' ? 'Importación' : 'Exportación'}</span>
            </div>
            <div className="details-row">
              <span className="label">Documento:</span>
              <span className="value">{selectedMovement.documentNumber}</span>
            </div>
            <div className="details-row">
              <span className="label">Fecha:</span>
              <span className="value">{new Date(selectedMovement.dateOfMovement).toLocaleDateString()}</span>
            </div>
            <div className="details-row">
              <span className="label">País:</span>
              <span className="value">{selectedMovement.country}</span>
            </div>
            <div className="details-row">
              <span className="label">{selectedMovement.type === 'import' ? 'Destino:' : 'Origen:'}</span>
              <span className="value">
                {selectedMovement.type === 'import' ? selectedMovement.destination : selectedMovement.origin}
              </span>
            </div>
            <div className="details-row">
              <span className="label">Cantidad:</span>
              <span className="value">{selectedMovement.animalCount} {selectedMovement.animalType}</span>
            </div>
            <div className="details-row">
              <span className="label">Propósito:</span>
              <span className="value">{selectedMovement.purpose}</span>
            </div>
            <div className="details-row">
              <span className="label">Estado Sanitario:</span>
              <span className="value">{selectedMovement.healthStatus}</span>
            </div>
            <div className="details-row">
              <span className="label">Responsable:</span>
              <span className="value">{selectedMovement.responsible}</span>
            </div>
            
            {selectedMovement.hasAlert && (
              <div className="alert-section">
                <h4>Información de Alerta</h4>
                <p>{selectedMovement.alertReason}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementView;