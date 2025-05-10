
// components/common/Map.js
import React from 'react';

const Map = ({ markers = [], title }) => {
  // En un MVP real se integraría Leaflet, Google Maps u otra librería
  // Para esta versión simplificada, usamos un mapa simulado
  
  return (
    <div className="map-container">
      <h3>{title || "Mapa de Ubicaciones"}</h3>
      <div className="map-simulation">
        <div className="map-background">
          {/* Simulación visual del mapa de Colombia */}
          <div className="colombia-outline"></div>
          
          {/* Renderizamos los marcadores */}
          {markers.map((marker, index) => (
            <div
              key={index}
              className={`map-marker ${marker.type || ''} ${marker.status || ''}`}
              style={{
                left: `${(marker.coordinates.lng + 80) * 5}px`,
                top: `${(10 - marker.coordinates.lat) * 15}px`
              }}
              title={`${marker.title || marker.id}: ${marker.description || ''}`}
            >
              <span className="marker-dot"></span>
            </div>
          ))}
        </div>
      </div>
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot active"></span> Activo
        </div>
        <div className="legend-item">
          <span className="legend-dot controlled"></span> Controlado
        </div>
        <div className="legend-item">
          <span className="legend-dot eradicated"></span> Erradicado
        </div>
      </div>
    </div>
  );
};

export default Map;
