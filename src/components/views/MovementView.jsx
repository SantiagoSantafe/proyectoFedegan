import React, { useState, useEffect } from 'react';
import EnhancedMap from '../common/EnhancedMap';
import EnhancedChart from '../common/EnhancedChart';
import DataTable from '../common/DataTable';
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
    { header: 'Documento', accessor: 'documentNumber' },
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
            type: 'origin',
            movementId: movement.id,
            hasAlert: movement.hasAlert,
            alertReason: movement.alertReason
          });
        }
        
        // Punto de destino
        if (movement.coordinates.destination) {
          markers.push({
            id: `destination-${movement.id}`,
            title: `${movement.type === 'import' ? 'Destino' : 'Destino'}: ${movement.type === 'import' ? movement.destination : movement.country}`,
            description: `${movement.animalCount} ${movement.animalType}`,
            coordinates: movement.coordinates.destination,
            type: 'destination',
            movementId: movement.id,
            hasAlert: movement.hasAlert,
            alertReason: movement.alertReason
          });
        }
      }
    });
    
    return markers;
  };
  
  // Preparar datos para gráficos
  const getChartData = () => {
    // Datos agrupados por país
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
    
    // Datos agrupados por propósito
    const byPurpose = filteredData.reduce((acc, curr) => {
      const purpose = curr.purpose;
      if (!acc[purpose]) acc[purpose] = 0;
      acc[purpose] += curr.animalCount;
      return acc;
    }, {});
    
    // Datos agregados por tipo de movimiento
    const byMovementType = [
      { name: 'Importaciones', value: filteredData.filter(m => m.type === 'import').reduce((sum, curr) => sum + curr.animalCount, 0) },
      { name: 'Exportaciones', value: filteredData.filter(m => m.type === 'export').reduce((sum, curr) => sum + curr.animalCount, 0) }
    ];
    
    // Convertir a formato para gráficos
    return {
      byCountry: Object.entries(byCountry).map(([name, values]) => ({
        name,
        imports: values.imports,
        exports: values.exports
      })),
      byPurpose: Object.entries(byPurpose).map(([name, value]) => ({ name, value })),
      byMovementType
    };
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
      
      {/* Estadísticas rápidas */}
      <div className="stats-summary">
        <div className="summary-box">
          <span className="summary-label">Total Movimientos</span>
          <span className="summary-value">{filteredData.length}</span>
        </div>
        <div className="summary-box">
          <span className="summary-label">Importaciones</span>
          <span className="summary-value">{filteredData.filter(m => m.type === 'import').length}</span>
        </div>
        <div className="summary-box">
          <span className="summary-label">Exportaciones</span>
          <span className="summary-value">{filteredData.filter(m => m.type === 'export').length}</span>
        </div>
        <div className="summary-box">
          <span className="summary-label">Total Animales</span>
          <span className="summary-value">{filteredData.reduce((sum, curr) => sum + curr.animalCount, 0)}</span>
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
                <li key={movement.id} onClick={() => setSelectedMovement(movement)}>
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
          <EnhancedMap 
            markers={getMapMarkers()} 
            title="Mapa de Movimientos de Ganado"
            center={[4.570868, -74.297333]} 
            zoom={5}
          />
        )}
        
        {activeTab === 'chart' && (
          <div className="charts-grid">
            <EnhancedChart 
              type="pie"
              data={getChartData().byMovementType}
              title="Distribución por Tipo de Movimiento"
              height={350}
            />
            
            <EnhancedChart 
              type="stackedBar"
              data={getChartData().byCountry}
              title="Movimientos por País"
              xAxisLabel="País"
              yAxisLabel="Cantidad de Animales"
              height={350}
            />
            
            <EnhancedChart 
              type="pie"
              data={getChartData().byPurpose}
              title="Distribución por Propósito"
              height={350}
            />
          </div>
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
                
                <div className="alert-actions">
                  <button className="btn-secondary">Revisar Documentación</button>
                  <button className="btn-primary">Marcar como Revisado</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementView;