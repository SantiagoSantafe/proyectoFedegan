// components/common/DataTable.js

import React, { useState } from 'react';



const DataTable = ({ data, columns, onRowClick }) => {

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  

  // Calcular paginación

  const indexOfLastRow = currentPage * rowsPerPage;

  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  

  // Funciones para cambiar de página

  const nextPage = () => {

    if (currentPage < totalPages) {

      setCurrentPage(currentPage + 1);

    }

  };

  

  const prevPage = () => {

    if (currentPage > 1) {

      setCurrentPage(currentPage - 1);

    }

  };

  

  // Formatear valores para visualización

  const formatValue = (value, column) => {

    if (value === undefined || value === null) return '-';

    

    if (column.format) return column.format(value);

    

    if (typeof value === 'boolean') return value ? 'Sí' : 'No';

    

    if (value instanceof Date) return value.toLocaleDateString();

    

    return value;

  };

  

  return (

    <div className="data-table-container">

      <table className="data-table">

        <thead>

          <tr>

            {columns.map((column, index) => (

              <th key={index}>{column.header}</th>

            ))}

          </tr>

        </thead>

        <tbody>

          {currentRows.map((row, rowIndex) => (

            <tr 

              key={rowIndex} 

              onClick={() => onRowClick && onRowClick(row)}

              className={onRowClick ? 'clickable-row' : ''}

            >

              {columns.map((column, colIndex) => (

                <td key={colIndex}>

                  {formatValue(

                    typeof column.accessor === 'function' 

                      ? column.accessor(row) 

                      : row[column.accessor],

                    column

                  )}

                </td>

              ))}

            </tr>

          ))}

        </tbody>

      </table>

      

      {totalPages > 1 && (

        <div className="pagination">

          <button onClick={prevPage} disabled={currentPage === 1}>

            Anterior

          </button>

          <span>

            Página {currentPage} de {totalPages}

          </span>

          <button onClick={nextPage} disabled={currentPage === totalPages}>

            Siguiente

          </button>

        </div>

      )}

    </div>

  );

};



export default DataTable;



// components/common/Chart.js
