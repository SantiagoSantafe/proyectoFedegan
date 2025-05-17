import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VaccinationView from './VaccinationView';
import { vaccinationsData } from '../../data/mockData';

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
        <div>Data points: {data ? data.length : 0}</div>
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

describe('VaccinationView Component', () => {
  test('renders correctly with initial state', () => {
    render(<VaccinationView />);
    
    // Verify header is rendered
    expect(screen.getByText('Jornadas de Vacunación')).toBeInTheDocument();
    expect(screen.getByText(/Seguimiento y monitoreo de las campañas/)).toBeInTheDocument();
    
    // Verify filters are rendered
    expect(screen.getByText('Región:')).toBeInTheDocument();
    expect(screen.getByText('Campaña:')).toBeInTheDocument();
    expect(screen.getByText('Vacunador:')).toBeInTheDocument();
    expect(screen.getByText('Desde:')).toBeInTheDocument();
    expect(screen.getByText('Hasta:')).toBeInTheDocument();
    
    // Verify summary is rendered
    expect(screen.getByText('Jornadas:')).toBeInTheDocument();
    expect(screen.getByText('Animales Vacunados:')).toBeInTheDocument();
    expect(screen.getByText('Machos/Hembras:')).toBeInTheDocument();
    expect(screen.getByText('Jóvenes/Adultos:')).toBeInTheDocument();
    
    // Verify tabs are rendered
    expect(screen.getByText('Tabla')).toBeInTheDocument();
    expect(screen.getByText('Mapa')).toBeInTheDocument();
    expect(screen.getByText('Gráficos')).toBeInTheDocument();
    
    // Verify table is initially displayed
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });
  
  test('filters data correctly', async () => {
    render(<VaccinationView />);
    
    // Check initial number of rows
    const initialRows = screen.getAllByTestId('table-row');
    const initialCount = initialRows.length;
    
    // Apply a region filter
    const regionFilter = screen.getByLabelText('Región:');
    const regions = [...new Set(vaccinationsData.map(v => v.region))];
    
    if (regions.length > 0) {
      userEvent.selectOptions(regionFilter, regions[0]);
      
      // Check that rows are filtered
      await waitFor(() => {
        const filteredRows = screen.getAllByTestId('table-row');
        
        // If there are vaccinations in the selected region, count should be less than initial
        const regionCount = vaccinationsData.filter(v => v.region === regions[0]).length;
        if (regionCount < vaccinationsData.length) {
          expect(filteredRows.length).toBeLessThan(initialCount);
        }
        
        // All rows should contain the selected region
        filteredRows.forEach(row => {
          expect(row.textContent).toContain(regions[0]);
        });
      });
    }
    
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
    render(<VaccinationView />);
    
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
      expect(screen.getAllByTestId(/enhanced-chart/)).toHaveLength(6); // All chart types
      expect(screen.queryByTestId('enhanced-map')).not.toBeInTheDocument();
    });
    
    // Switch back to table
    const tableTab = screen.getByText('Tabla');
    fireEvent.click(tableTab);
    
    // Check table is displayed again
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
      expect(screen.queryByTestId(/enhanced-chart/)).not.toBeInTheDocument();
    });
  });
  
  test('shows vaccination details when a row is clicked', async () => {
    render(<VaccinationView />);
    
    // Initially details panel is not shown
    expect(screen.queryByText('Detalles de Vacunación')).not.toBeInTheDocument();
    
    // Click on a row
    const firstRow = screen.getAllByTestId('table-row')[0];
    fireEvent.click(firstRow);
    
    // Check details panel is shown
    await waitFor(() => {
      expect(screen.getByText('Detalles de Vacunación')).toBeInTheDocument();
      expect(screen.getByText('Conteo de Animales')).toBeInTheDocument();
    });
    
    // Verify chart data is displayed
    expect(screen.getAllByTestId(/enhanced-chart/)).toHaveLength(2);
    
    // Close the panel
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    // Check details panel is closed
    await waitFor(() => {
      expect(screen.queryByText('Detalles de Vacunación')).not.toBeInTheDocument();
    });
  });
  
  test('displays correct statistics based on filtered data', async () => {
    render(<VaccinationView />);
    
    // Get initial stats
    const totalAnimalsText = screen.getByText('Animales Vacunados:').nextSibling.textContent;
    const initialTotalAnimals = parseInt(totalAnimalsText);
    
    // Apply a campaign filter
    const campaignFilter = screen.getByLabelText('Campaña:');
    const campaigns = [...new Set(vaccinationsData.map(v => v.campaign))];
    
    if (campaigns.length > 0) {
      userEvent.selectOptions(campaignFilter, campaigns[0]);
      
      // Calculate expected totals
      const filteredData = vaccinationsData.filter(v => v.campaign === campaigns[0]);
      const expectedAnimals = filteredData.reduce((sum, curr) => sum + curr.animalsVaccinated, 0);
      
      // Check the stats are updated correctly
      await waitFor(() => {
        const newTotalAnimalsText = screen.getByText('Animales Vacunados:').nextSibling.textContent;
        const newTotalAnimals = parseInt(newTotalAnimalsText);
        expect(newTotalAnimals).toBe(expectedAnimals);
        
        if (filteredData.length < vaccinationsData.length) {
          expect(newTotalAnimals).toBeLessThan(initialTotalAnimals);
        }
      });
    }
  });
  
  test('displays trend chart when multiple date points exist', async () => {
    render(<VaccinationView />);
    
    // Switch to charts tab
    const chartTab = screen.getByText('Gráficos');
    fireEvent.click(chartTab);
    
    // Check if there are multiple date points in the mock data
    const uniqueDates = new Set(vaccinationsData.map(v => new Date(v.dateCreated).toLocaleDateString()));
    
    await waitFor(() => {
      const trendChartTitle = screen.queryByText('Tendencia de Vacunación');
      
      if (uniqueDates.size > 1) {
        expect(trendChartTitle).toBeInTheDocument();
      } else {
        expect(trendChartTitle).not.toBeInTheDocument();
      }
    });
  });
});