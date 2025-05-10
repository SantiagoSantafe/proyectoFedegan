// components/common/EnhancedChart.js - Con correcciones aplicadass
import React from 'react';
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  CartesianGrid,
  XAxis, YAxis,
  Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

// Paleta de colores profesional
const COLORS = [
  '#2E7D32', // Verde FEDEGÁN (primario)
  '#4CAF50', // Verde claro
  '#81C784', // Verde más claro
  '#1B5E20', // Verde oscuro
  '#FFC107', // Ámbar
  '#FF8F00', // Ámbar oscuro
  '#2196F3', // Azul
  '#0D47A1', // Azul oscuro
  '#F44336', // Rojo
  '#B71C1C'  // Rojo oscuro
];

// Configuración mejorada para etiquetas de Pie - Corrige el solapamiento de etiquetas
const renderCustomizedLabel = ({ 
  cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value 
}) => {
  const RADIAN = Math.PI / 180;
  // Aumentamos el radio para alejar las etiquetas del pie
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Solo mostrar etiqueta si el porcentaje es mayor al 8% para evitar solapamiento
  return percent > 0.08 ? (
    <text 
      x={x} 
      y={y} 
      fill="#333333"
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name}: ${value}`}
    </text>
  ) : null;
};

const EnhancedChart = ({ 
  type, 
  data, 
  title, 
  dataKey = 'value',
  nameKey = 'name',
  xAxisLabel,
  yAxisLabel,
  height = 300,
  secondaryDataKey,
  stacked = false,
  className = ""
}) => {
  
  // Formatear números para los tooltips - Mejora la presentación
  const formatNumber = (number) => {
    if (typeof number !== 'number') return number;
    return number.toLocaleString('es-CO');
  };
  
  // Tooltip mejorado con mejor formateo y estilo
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {type !== 'pie' && <p className="tooltip-label" style={{ 
            margin: '0 0 5px', 
            fontWeight: 'bold' 
          }}>{`${label}`}</p>}
          
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ 
              color: entry.color,
              margin: '2px 0'
            }}>
              {type === 'pie' ? 
                `${entry.name}: ${formatNumber(entry.value)}` : 
                `${entry.name}: ${formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Renderizar gráfico según el tipo - Con mejoras específicas para cada tipo
  const renderChart = () => {
    switch(type) {
      case 'bar':
        return (
          <BarChart data={data} barSize={30} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={nameKey} 
              tick={{ fontSize: 12 }}
              label={xAxisLabel ? { 
                value: xAxisLabel, 
                position: 'insideBottom', 
                offset: -15,
                fontSize: 12
              } : null} 
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={yAxisLabel ? { 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                fontSize: 12,
                dx: -10
              } : null}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              verticalAlign="bottom"
            />
            <Bar dataKey={dataKey} name={dataKey} fill={COLORS[0]} />
            {secondaryDataKey && (
              <Bar dataKey={secondaryDataKey} name={secondaryDataKey} fill={COLORS[1]} />
            )}
          </BarChart>
        );
      
      case 'stackedBar':
        return (
          <BarChart data={data} barSize={30} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={nameKey} 
              tick={{ fontSize: 12 }}
              label={xAxisLabel ? { 
                value: xAxisLabel, 
                position: 'insideBottom', 
                offset: -15,
                fontSize: 12
              } : null} 
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={yAxisLabel ? { 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                fontSize: 12,
                dx: -10
              } : null}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              verticalAlign="bottom"
            />
            <Bar dataKey="imports" name="Importaciones" stackId="a" fill={COLORS[0]} />
            <Bar dataKey="exports" name="Exportaciones" stackId="a" fill={COLORS[1]} />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={nameKey}
              tick={{ fontSize: 12 }}
              label={xAxisLabel ? { 
                value: xAxisLabel, 
                position: 'insideBottom', 
                offset: -15,
                fontSize: 12
              } : null} 
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={yAxisLabel ? { 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                fontSize: 12,
                dx: -10
              } : null}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
              verticalAlign="bottom"
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={COLORS[0]} 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
            {secondaryDataKey && (
              <Line 
                type="monotone" 
                dataKey={secondaryDataKey} 
                stroke={COLORS[1]} 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            )}
          </LineChart>
        );
      
      case 'pie':
      default:
        return (
          <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={75}
              innerRadius={0}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
              animationDuration={1000}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle"
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value, entry, index) => {
                if (index < data.length) {
                  const item = data[index];
                  return `${item[nameKey]}: ${formatNumber(item[dataKey])}`;
                }
                return value;
              }}
            />
          </PieChart>
        );
    }
  };

  return (
    <div className={`enhanced-chart-container ${className}`} style={{ 
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      {title && <h3 className="chart-title" style={{
        textAlign: 'center',
        margin: '0 0 15px',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#333'
      }}>{title}</h3>}
      <div className="chart-content" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnhancedChart;
