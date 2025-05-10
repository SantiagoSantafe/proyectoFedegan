import React from 'react';

const Chart = ({ type, data, title }) => {
  // En un MVP real se integraría Chart.js, Recharts u otra librería
  // Para esta versión simplificada, usamos gráficos simulados

  // Función para calcular el valor máximo en los datos
  const getMaxValue = () => {
    if (!data || data.length === 0) return 100;
    
    return Math.max(...data.map(item => 
      typeof item.value === 'number' ? item.value : 0
    )) * 1.2; // Añadimos un 20% más para espacio visual
  };
  
  const maxValue = getMaxValue();
  
  const renderBarChart = () => (
    <div className="chart-bars">
      {data.map((item, index) => (
        <div key={index} className="bar-container">
          <div 
            className="bar" 
            style={{ height: `${(item.value / maxValue) * 100}%` }}
            title={`${item.name}: ${item.value}`}
          ></div>
          <div className="bar-label">{item.name}</div>
        </div>
      ))}
    </div>
  );
  
  const renderPieChart = () => (
    <div className="chart-pie">
      <div className="pie-container">
        <div className="pie-simulation">
          {data.map((item, index) => (
            <div 
              key={index}
              className="pie-segment" 
              style={{ 
                backgroundColor: getColorForIndex(index),
                width: '100%',
                height: '100%',
                clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(getStartAngle(index))}% ${50 + 50 * Math.sin(getStartAngle(index))}%, ${50 + 50 * Math.cos(getEndAngle(index))}% ${50 + 50 * Math.sin(getEndAngle(index))}%)`
              }}
              title={`${item.name}: ${item.value}`}
            ></div>
          ))}
        </div>
      </div>
      <div className="pie-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <span 
              className="color-box" 
              style={{ backgroundColor: getColorForIndex(index) }}
            ></span>
            <span>{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Funciones auxiliares para el gráfico de pie
  function getColorForIndex(index) {
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8E24AA', '#16A2D7'];
    return colors[index % colors.length];
  }
  
  function getStartAngle(index) {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const prevItemsSum = data.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    return (prevItemsSum / totalValue) * 2 * Math.PI - Math.PI/2;
  }
  
  function getEndAngle(index) {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const prevItemsSum = data.slice(0, index + 1).reduce((sum, item) => sum + item.value, 0);
    return (prevItemsSum / totalValue) * 2 * Math.PI - Math.PI/2;
  }
  
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="chart-content">
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
        {type !== 'bar' && type !== 'pie' && <p>Tipo de gráfico no soportado</p>}
      </div>
    </div>
  );
};

export default Chart;