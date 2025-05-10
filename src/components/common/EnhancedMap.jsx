// components/common/EnhancedMap.js
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Solución para el problema de iconos en Leaflet con React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const EnhancedMap = ({ 
  markers = [], 
  title = "Mapa",
  center = [4.570868, -74.297333], // Coordenadas de Colombia
  zoom = 6,
  height = "500px" 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Inicializar mapa
  useEffect(() => {
    if (!mapInstanceRef.current) {
      // Crear instancia del mapa
      mapInstanceRef.current = L.map(mapRef.current, {
        center: center,
        zoom: zoom,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })
        ]
      });

      // Añadir control de escala
      L.control.scale().addTo(mapInstanceRef.current);
      
      // Añadir capa para los marcadores
      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    // Limpiar al desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Actualizar marcadores cuando cambian
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      // Limpiar marcadores anteriores
      markersLayerRef.current.clearLayers();
      
      // Añadir nuevos marcadores
      markers.forEach(marker => {
        let markerIcon;
        
        // Personalizar iconos según el tipo de marcador
        if (marker.type === 'outbreak') {
          // Iconos para brotes según su estado
          const color = marker.status === 'active' ? '#d32f2f' : 
                        marker.status === 'controlled' ? '#ff8f00' : '#2e7d32';
          
          markerIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color:${color}; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });
          
          // Crear círculo para representar área afectada
          const radius = marker.affectedAnimals * 100; // Radio proporcional al número de animales
          L.circle([marker.coordinates.lat, marker.coordinates.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            radius: Math.min(radius, 20000) // Limitar el radio máximo
          }).addTo(markersLayerRef.current);
          
        } else if (marker.type === 'origin') {
          // Icono para origen de movimiento
          markerIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color:#3949ab; width:10px; height:10px; border-radius:50%; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          
        } else if (marker.type === 'destination') {
          // Icono para destino de movimiento
          markerIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color:#00acc1; width:10px; height:10px; border-radius:50%; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          
        } else {
          // Icono por defecto (vacunación u otros)
          markerIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color:#2e7d32; width:10px; height:10px; border-radius:50%; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
        }
        
        // Crear marcador con el icono personalizado
        const leafletMarker = L.marker([marker.coordinates.lat, marker.coordinates.lng], { icon: markerIcon })
          .addTo(markersLayerRef.current);
        
        // Añadir información al popup
        leafletMarker.bindPopup(`
          <div class="map-popup">
            <h4>${marker.title || 'Ubicación'}</h4>
            <p>${marker.description || ''}</p>
            ${marker.status ? `<p><strong>Estado:</strong> ${
              marker.status === 'active' ? 'Activo' : 
              marker.status === 'controlled' ? 'Controlado' : 'Erradicado'
            }</p>` : ''}
            ${marker.hasAlert ? `<p class="alert">⚠️ Alerta: ${marker.alertReason || 'Requiere atención'}</p>` : ''}
          </div>
        `);
      });
      
      // Conectar puntos de origen-destino para movimientos
      const movementPairs = {};
      
      markers.forEach(marker => {
        // Si el marcador tiene un movementId, lo agregamos a un par
        if (marker.movementId) {
          if (!movementPairs[marker.movementId]) {
            movementPairs[marker.movementId] = { origin: null, destination: null };
          }
          
          if (marker.type === 'origin') {
            movementPairs[marker.movementId].origin = marker;
          } else if (marker.type === 'destination') {
            movementPairs[marker.movementId].destination = marker;
          }
        }
      });
      
      // Crear líneas para los pares origen-destino
      Object.values(movementPairs).forEach(pair => {
        if (pair.origin && pair.destination) {
          const lineColor = pair.origin.hasAlert ? '#d32f2f' : '#3949ab';
          const lineDash = pair.origin.hasAlert ? [5, 5] : [];
          
          L.polyline([
            [pair.origin.coordinates.lat, pair.origin.coordinates.lng],
            [pair.destination.coordinates.lat, pair.destination.coordinates.lng]
          ], {
            color: lineColor,
            weight: 2,
            opacity: 0.6,
            dashArray: lineDash
          }).addTo(markersLayerRef.current);
        }
      });
    }
  }, [markers]);

  // Ajustar la vista del mapa cuando cambian los marcadores
  useEffect(() => {
    if (mapInstanceRef.current && markers.length > 0) {
      // Recolectar todas las coordenadas
      const points = markers.map(m => [m.coordinates.lat, m.coordinates.lng]);
      
      // Si hay más de 1 punto, ajustar la vista
      if (points.length > 1) {
        mapInstanceRef.current.fitBounds(points);
      } else if (points.length === 1) {
        mapInstanceRef.current.setView(points[0], zoom);
      } else {
        mapInstanceRef.current.setView(center, zoom);
      }
    }
  }, [markers, center, zoom]);

  return (
    <div className="enhanced-map-container">
      <div className="map-header">
        <h3>{title}</h3>
      </div>
      <div 
        ref={mapRef} 
        className="leaflet-map" 
        style={{ height }}
      />
      <div className="map-footer">
        <div className="map-legend">
          {markers.some(m => m.type === 'outbreak' && m.status === 'active') && (
            <div className="legend-item">
              <span className="legend-dot active"></span> Brote Activo
            </div>
          )}
          {markers.some(m => m.type === 'outbreak' && m.status === 'controlled') && (
            <div className="legend-item">
              <span className="legend-dot controlled"></span> Brote Controlado
            </div>
          )}
          {markers.some(m => m.type === 'outbreak' && m.status === 'eradicated') && (
            <div className="legend-item">
              <span className="legend-dot eradicated"></span> Brote Erradicado
            </div>
          )}
          {markers.some(m => m.type === 'origin') && (
            <div className="legend-item">
              <span className="legend-dot origin"></span> Origen
            </div>
          )}
          {markers.some(m => m.type === 'destination') && (
            <div className="legend-item">
              <span className="legend-dot destination"></span> Destino
            </div>
          )}
          {markers.some(m => !m.type || (!['outbreak', 'origin', 'destination'].includes(m.type))) && (
            <div className="legend-item">
              <span className="legend-dot vaccination"></span> Vacunación
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMap;