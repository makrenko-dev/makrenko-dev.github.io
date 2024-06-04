import React from 'react';
import { useTable } from 'react-table';
import Table from 'react-bootstrap/Table';
import { FaTrash } from 'react-icons/fa'; // Importing the trash icon
import 'bootstrap/dist/css/bootstrap.min.css';

const DataTable = ({ data = [], columns = [], handleRemove, recordIds = [] }) => {
  const isPlaceholderData = data.length === 1 && data[0].UserName === 'Поки що немає жодної вподобайки';

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <Table striped bordered hover>
      <thead className="thead-dark">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()} className="text-left">
                {column.render('Header')}
              </th>
            ))}
            {!isPlaceholderData && handleRemove && <th>Дії</th>} {/* Add header for actions column only if there is actual data */}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()} className="text-left">
                  {cell.render('Cell')}
                </td>
              ))}
              {!isPlaceholderData && handleRemove && (
                <td>
                  {/* Add trash button to remove the row */}
                  <button onClick={() => handleRemove(recordIds[i])}>
                    <FaTrash />
                  </button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default DataTable;
