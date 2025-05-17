import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OutbreaksView from './OutbreaksView';
import { outbreaksData } from '../../data/mockData';

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

describe('OutbreaksView Component', () => {
  test('renders correctly with initial state', () => {
    render(<OutbreaksView />);
    
    // Verify header is rendered
    expect(screen.getByText('Brotes Sanitarios')).toBeInTheDocument();
    expect(screen.getByText(/Mapa interactivo de brotes sanitarios/)).toBeInTheDocument();
    
    // Verify filters are rendered
    expect(screen.getByText('Enfermedad:')).toBeInTheDocument();
    expect(screen.getByText('Estado:')).toBeInTheDocument();
    expect(screen.getByText('Región:')).toBeInTheDocument();
    expect(screen.getByText('Severidad:')).toBeInTheDocument();
    
    // Verify summary is rendered
    expect(screen.getByText('Total Brotes:')).toBeInTheDocument();
    expect(screen.getByText('Activos:')).toBeInTheDocument();
    expect(screen.getByText('Controlados:')).toBeInTheDocument();
    expect(screen.getByText('Erradicados:')).toBeInTheDocument();
    
    // Verify map is rendered
    expect(screen.getByTestId('enhanced-map')).toBeInTheDocument();
    
    // Verify charts are rendered
    expect(screen.getAllByTestId(/enhanced-chart/)).toHaveLength(5);
    
    // Verify list is rendered
    expect(screen.getByText('Listado de Brotes')).toBeInTheDocument();
  });
  
  test('filters data correctly', async () => {
    render(<OutbreaksView />);
    
    // Get all table rows initially
    const initialRows = screen.getAllByRole('row').slice(1); // Remove header row
    const initialCount = initialRows.length;
    
    // Apply a status filter
    const statusFilter = screen.getByLabelText('Estado:');
    userEvent.selectOptions(statusFilter, 'active');
    
    // Check that rows are filtered
    await waitFor(() => {
      const filteredRows = screen.getAllByRole('row').slice(1);
      expect(filteredRows.length).toBeLessThan(initialCount);
      // Verify that all visible rows have 'Activo' status
      filteredRows.forEach(row => {
        expect(row.textContent).toContain('Activo');
      });
    });
    
    // Reset filters
    const resetButton = screen.getByText('Limpiar Filtros');
    fireEvent.click(resetButton);
    
    // Check rows are reset
    await waitFor(() => {
      const resetRows = screen.getAllByRole('row').slice(1);
      expect(resetRows.length).toBe(initialCount);
    });
  });
  
  test('shows outbreak details when a row is clicked', async () => {
    render(<OutbreaksView />);
    
    // Initially details panel is not shown
    expect(screen.queryByText(/Detalles del Brote/)).not.toBeInTheDocument();
    
    // Click on a details button
    const detailsButtons = screen.getAllByText('Ver Detalles');
    fireEvent.click(detailsButtons[0]);
    
    // Check details panel is shown
    await waitFor(() => {
      expect(screen.getByText(/Detalles del Brote/)).toBeInTheDocument();
      expect(screen.getByText('Evolución del Brote')).toBeInTheDocument();
      expect(screen.getByText('Medidas Tomadas')).toBeInTheDocument();
    });
    
    // Close the panel
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    // Check details panel is closed
    await waitFor(() => {
      expect(screen.queryByText(/Detalles del Brote/)).not.toBeInTheDocument();
    });
  });
  
  test('displays correct statistics based on filtered data', async () => {
    render(<OutbreaksView />);
    
    // Get initial stats
    const totalText = screen.getByText('Total Brotes:').nextSibling.textContent;
    const initialTotal = parseInt(totalText);
    
    // Apply a filter
    const severityFilter = screen.getByLabelText('Severidad:');
    userEvent.selectOptions(severityFilter, 'alta');
    
    // Get high severity outbreaks count from mock data
    const highSeverityCount = outbreaksData.filter(o => o.severity === 'alta').length;
    
    // Check the total is updated
    await waitFor(() => {
      const newTotalText = screen.getByText('Total Brotes:').nextSibling.textContent;
      const newTotal = parseInt(newTotalText);
      expect(newTotal).toBe(highSeverityCount);
      expect(newTotal).toBeLessThan(initialTotal);
    });
  });
  
  test('displays progress chart for active outbreaks', async () => {
    render(<OutbreaksView />);
    
    // Check if there are active outbreaks in the mock data
    const hasActiveOutbreaks = outbreaksData.some(o => o.status === 'active');
    
    if (hasActiveOutbreaks) {
      // There should be an evolution chart
      expect(screen.getByText('Evolución de Brotes Activos')).toBeInTheDocument();
    }
    
    // Filter to only show controlled outbreaks
    const statusFilter = screen.getByLabelText('Estado:');
    userEvent.selectOptions(statusFilter, 'controlled');
    
    // Evolution chart might not be visible now
    await waitFor(() => {
      const evolutionHeader = screen.queryByText('Evolución de Brotes Activos');
      if (outbreaksData.filter(o => o.status === 'controlled').length > 0) {
        // There should be controlled outbreaks but no evolution chart for them
        expect(evolutionHeader).not.toBeInTheDocument();
      }
    });
  });
});