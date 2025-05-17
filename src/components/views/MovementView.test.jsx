// src/components/views/__tests__/MovementView.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MovementView from './MovementView';
import { movementsData } from '../../data/mockData';

// Mock de los componentes externos
jest.mock('../common/EnhancedMap', () => {
  return function MockEnhancedMap({ markers, title }) {
    return (
      <div data-testid="enhanced-map">
        <h3>{title}</h3>
        <div>Markers count: {markers.length}</div>
      </div>
    );
  };
});

jest.mock('../common/EnhancedChart', () => {
  return function MockEnhancedChart({ type, data, title }) {
    return (
      <div data-testid={`enhanced-chart-${type}`}>
        <h3>{title}</h3>
        <div>Data points: {data.length}</div>
      </div>
    );
  };
});

jest.mock('../common/DataTable', () => {
  return function MockDataTable({ data, columns, onRowClick }) {
    return (
      <div data-testid="data-table">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.header}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} data-testid="table-row" onClick={() => onRowClick(row)}>
                {columns.map((col) => (
                  <td key={col.accessor}>
                    {col.format ? col.format(row[col.accessor]) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
});

describe('MovementView Component', () => {
  test('renders correctly with initial state', () => {
    render(<MovementView />);
    
    // Verify header is rendered
    expect(screen.getByText('Movimiento de Ganado')).toBeInTheDocument();
    expect(screen.getByText(/Monitoreo de importaciones y exportaciones/)).toBeInTheDocument();
    
    // Verify filters are rendered
    expect(screen.getByText('Tipo:')).toBeInTheDocument();
    expect(screen.getByText('País:')).toBeInTheDocument();
    expect(screen.getByText('Desde:')).toBeInTheDocument();
    expect(screen.getByText('Hasta:')).toBeInTheDocument();
    
    // Verify stats are rendered
    expect(screen.getByText('Total Movimientos')).toBeInTheDocument();
    expect(screen.getByText('Importaciones')).toBeInTheDocument();
    expect(screen.getByText('Exportaciones')).toBeInTheDocument();
    expect(screen.getByText('Total Animales')).toBeInTheDocument();
    
    // Verify tabs are rendered
    expect(screen.getByText('Tabla')).toBeInTheDocument();
    expect(screen.getByText('Mapa')).toBeInTheDocument();
    expect(screen.getByText('Gráficos')).toBeInTheDocument();
    
    // Verify table is initially displayed
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });
  
  test('filters data correctly', async () => {
    render(<MovementView />);
    
    // Check initial number of rows
    const initialRows = screen.getAllByTestId('table-row');
    const initialCount = initialRows.length;
    
    // Apply a type filter
    const typeFilter = screen.getByLabelText('Tipo:');
    userEvent.selectOptions(typeFilter, 'import');
    
    // Check that rows are filtered
    await waitFor(() => {
      const filteredRows = screen.getAllByTestId('table-row');
      expect(filteredRows.length).toBeLessThan(initialCount);
    });
    
    // Reset filters
    const resetButton = screen.getByText('Limpiar Filtros');
    fireEvent.click(resetButton);
    
    // Check rows are reset
    await waitFor(() => {
      const resetRows = screen.getAllByTestId('table-row');
      expect(resetRows.length).toBe(initialCount);
    });
  });
  
  test('switches between tabs correctly', async () => {
    render(<MovementView />);
    
    // Initially shows table
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    
    // Switch to map
    const mapTab = screen.getByText('Mapa');
    fireEvent.click(mapTab);
    
    // Check map is displayed
    await waitFor(() => {
      expect(screen.getByTestId('enhanced-map')).toBeInTheDocument();
      expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
    });
    
    // Switch to charts
    const chartTab = screen.getByText('Gráficos');
    fireEvent.click(chartTab);
    
    // Check charts are displayed
    await waitFor(() => {
      expect(screen.getByTestId('enhanced-chart-pie')).toBeInTheDocument();
      expect(screen.getByTestId('enhanced-chart-stackedBar')).toBeInTheDocument();
      expect(screen.queryByTestId('enhanced-map')).not.toBeInTheDocument();
    });
    
    // Switch back to table
    const tableTab = screen.getByText('Tabla');
    fireEvent.click(tableTab);
    
    // Check table is displayed again
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
      expect(screen.queryByTestId('enhanced-chart-pie')).not.toBeInTheDocument();
    });
  });
  
  test('shows movement details when a row is clicked', async () => {
    render(<MovementView />);
    
    // Initially details panel is not shown
    expect(screen.queryByText('Detalles del Movimiento')).not.toBeInTheDocument();
    
    // Click on a row
    const firstRow = screen.getAllByTestId('table-row')[0];
    fireEvent.click(firstRow);
    
    // Check details panel is shown
    await waitFor(() => {
      expect(screen.getByText('Detalles del Movimiento')).toBeInTheDocument();
    });
    
    // Close the panel
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    // Check details panel is closed
    await waitFor(() => {
      expect(screen.queryByText('Detalles del Movimiento')).not.toBeInTheDocument();
    });
  });
  
  test('displays alert panel when alerts filter is applied', async () => {
    render(<MovementView />);
    
    // Initially alerts panel is not shown
    expect(screen.queryByText('Alertas Activas')).not.toBeInTheDocument();
    
    // Check the alerts filter
    const alertFilter = screen.getByLabelText('Solo con alertas');
    fireEvent.click(alertFilter);
    
    // Check if there are movements with alerts
    const alertsExist = movementsData.some(m => m.hasAlert);
    
    if (alertsExist) {
      // Check alerts panel is shown
      await waitFor(() => {
        expect(screen.getByText('Alertas Activas')).toBeInTheDocument();
      });
    }
  });
});