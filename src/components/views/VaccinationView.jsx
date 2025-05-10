import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import Map from '../common/Map';
import Chart from '../common/Chart';
import { vaccinationsData } from '../../data/mockData';

const VaccinationView = () => {
  const [activeTab, setActiveTab] = useState('table');
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [filters, setFilters] = useState({
    region: '',
    campaign: '',
    dateStart: '',
    dateEnd: '',
    vaccinator: ''
  });
  
  // Filtrar datos según los filtros aplicados
  const getFilteredData = () => {
    return vaccinationsData.filter(vaccination => {
      // Filtro por región
      if (filters.region && vaccination.region !== filters.region) return false;
      
      // Filtro por campaña
      if (filters.campaign && vaccination.campaign !== filters.campaign) return false;
      
      // Filtro por vacunador
      if (filters.vaccinator && !vaccination.vaccinatorName.toLowerCase().includes(filters.vaccinator.toLowerCase())) 
        return false;
      
      // Filtro por fecha inicio
      if (filters.dateStart) {
        const startDate = new Date(filters.dateStart);
        const vaccinationDate = new Date(vaccination.dateCreated);
        if (vaccinationDate < startDate) return false;
      }
      
      // Filtro por fecha fin
      if (filters.dateEnd) {
        const endDate = new Date(filters.dateEnd);
        endDate.setHours(23, 59, 59);
        const vaccinationDate = new Date(vaccination.dateCreated);
        if (vaccinationDate > endDate) return false;
      }
      
      return true;
    });
  };
  
  const filteredData = getFilteredData();
  
  // Columnas para la tabla
  const columns = [
    { 
      header: 'Fecha', 
      accessor: 'dateCreated', 
      format: (value) => new Date(value).toLocaleDateString() 
    },
    { header: 'Vacunador', accessor: 'vaccinatorName' },
    { header: 'Finca', accessor: 'farm' },
    { header: 'Región', accessor: 'region' },
    { header: 'Municipio', accessor: 'municipality' },
    { header: 'Tipo de Vacuna', accessor: 'vaccineType' },
    { header: 'Animales Vacunados', accessor: 'animalsVaccinated' }
  ];
  
  // Obtener listas únicas para los filtros
  const regions = [...new Set(vaccinationsData.map(v => v.region))];
  const campaigns = [...new Set(vaccinationsData.map(v => v.campaign))];
  const vaccinators = [...new Set(vaccinationsData.map(v => v.vaccinatorName))];
  
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
      region: '',
      campaign: '',
      dateStart: '',
      dateEnd: '',
      vaccinator: ''
    });
  };
  
  // Preparar datos para el mapa
  const getMapMarkers = () => {
    return filteredData.map(vaccination => ({
      id: vaccination.id,
      title: vaccination.farm,
      description: `${vaccination.animalsVaccinated} animales vacunados`,
      coordinates: vaccination.coordinates
    }));
  };
  
  // Preparar datos para gráficos
  const getChartData = () => {
    // Datos por región
    const byRegion = filteredData.reduce((acc, curr) => {
      const region = curr.region;
      if (!acc[region]) acc[region] = 0;
      acc[region] += curr.animalsVaccinated;
      return acc;
    }, {});
    
    // Datos por tipo de vacuna
    const byVaccineType = filteredData.reduce((acc, curr) => {
      const vaccineType = curr.vaccineType;
      if (!acc[vaccineType]) acc[vaccineType] = 0;
      acc[vaccineType] += curr.animalsVaccinated;
      return acc;
    }, {});
    
    return {
      byRegion: Object.entries(byRegion).map(([name, value]) => ({ name, value })),
      byVaccineType: Object.entries(byVaccineType).map(([name, value]) => ({ name, value }))
    };
  };
  
  const chartData = getChartData();
  
  // Calcular estadísticas generales
  const getStatistics = () => {
    const totalAnimals = filteredData.reduce((sum, curr) => sum + curr.animalsVaccinated, 0);
    const totalMales = filteredData.reduce((sum, curr) => sum + curr.maleCount, 0);
    const totalFemales = filteredData.reduce((sum, curr) => sum + curr.femaleCount, 0);
    const totalYoung = filteredData.reduce((sum, curr) => sum + curr.youngCount, 0);
    const totalAdult = filteredData.reduce((sum, curr) => sum + curr.adultCount, 0);
    
    return {
      totalAnimals,
      totalMales,
      totalFemales,
      totalYoung,
      totalAdult,
      vaccinated: filteredData.length
    };
  };
  
  const stats = getStatistics();
  
  return (
    <div className="vaccination-view">
      <div className="view-header">
        <h2>Jornadas de Vacunación</h2>
        <p className="description">
          Seguimiento y monitoreo de las campañas de vacunación en todo el territorio nacional.
        </p>
      </div>
      
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-row">
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
              <label>Campaña:</label>
              <select 
                value={filters.campaign}
                onChange={(e) => handleFilterChange('campaign', e.target.value)}
              >
                <option value="">Todas</option>
                {campaigns.map(campaign => (
                  <option key={campaign} value={campaign}>{campaign}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Vacunador:</label>
              <select 
                value={filters.vaccinator}
                onChange={(e) => handleFilterChange('vaccinator', e.target.value)}
              >
                <option value="">Todos</option>
                {vaccinators.map(vaccinator => (
                  <option key={vaccinator} value={vaccinator}>{vaccinator}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="filter-row">
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
            
            <button className="reset-btn" onClick={resetFilters}>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
      
      <div className="vaccination-summary">
        <div className="summary-item">
          <span className="summary-label">Jornadas:</span>
          <span className="summary-value">{stats.vaccinated}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Animales Vacunados:</span>
          <span className="summary-value">{stats.totalAnimals}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Machos/Hembras:</span>
          <span className="summary-value">{stats.totalMales}/{stats.totalFemales}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Jóvenes/Adultos:</span>
          <span className="summary-value">{stats.totalYoung}/{stats.totalAdult}</span>
        </div>
      </div>
      
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
            onRowClick={setSelectedVaccination}
          />
        )}
        
        {activeTab === 'map' && (
          <Map 
            markers={getMapMarkers()} 
            title="Ubicación de Jornadas de Vacunación"
          />
        )}
        
        {activeTab === 'chart' && (
          <div className="charts-container">
            <div className="chart-row">
              <Chart 
                type="bar"
                data={chartData.byRegion}
                title="Animales Vacunados por Región"
              />
              <Chart 
                type="pie"
                data={chartData.byVaccineType}
                title="Distribución por Tipo de Vacuna"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Detalles de la vacunación seleccionada */}
      {selectedVaccination && (
        <div className="details-panel">
          <div className="details-header">
            <h3>Detalles de Vacunación</h3>
            <button className="close-btn" onClick={() => setSelectedVaccination(null)}>×</button>
          </div>
          
          <div className="details-content">
            <div className="details-row">
              <span className="label">Finca:</span>
              <span className="value">{selectedVaccination.farm}</span>
            </div>
            <div className="details-row">
              <span className="label">Ubicación:</span>
              <span className="value">{selectedVaccination.region}, {selectedVaccination.municipality}</span>
            </div>
            <div className="details-row">
              <span className="label">Fecha:</span>
              <span className="value">{new Date(selectedVaccination.dateCreated).toLocaleDateString()}</span>
            </div>
            <div className="details-row">
              <span className="label">Vacunador:</span>
              <span className="value">{selectedVaccination.vaccinatorName}</span>
            </div>
            <div className="details-row">
              <span className="label">Campaña:</span>
              <span className="value">{selectedVaccination.campaign} ({selectedVaccination.campaignStatus})</span>
            </div>
            <div className="details-row">
              <span className="label">Tipo de Vacuna:</span>
              <span className="value">{selectedVaccination.vaccineType}</span>
            </div>
            
            <div className="details-section">
              <h4>Conteo de Animales</h4>
              <div className="details-row">
                <span className="label">Total Vacunados:</span>
                <span className="value">{selectedVaccination.animalsVaccinated}</span>
              </div>
              <div className="details-row">
                <span className="label">Machos:</span>
                <span className="value">{selectedVaccination.maleCount}</span>
              </div>
              <div className="details-row">
                <span className="label">Hembras:</span>
                <span className="value">{selectedVaccination.femaleCount}</span>
              </div>
              <div className="details-row">
                <span className="label">Jóvenes:</span>
                <span className="value">{selectedVaccination.youngCount}</span>
              </div>
              <div className="details-row">
                <span className="label">Adultos:</span>
                <span className="value">{selectedVaccination.adultCount}</span>
              </div>
            </div>
            
            {selectedVaccination.observations && (
              <div className="details-section">
                <h4>Observaciones</h4>
                <p>{selectedVaccination.observations}</p>
              </div>
            )}
            
            <div className="details-actions">
              <button className="secondary-btn">Descargar Reporte</button>
              <button className="primary-btn">Ver Historial de Finca</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationView;