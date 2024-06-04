import React from 'react';
import { useTable } from 'react-table';
import Table from 'react-bootstrap/Table'; // Импортируем компонент таблицы из React Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'; // Импортируем стили React Bootstrap

const Itemtable = ({ discipline, columns }) => {
  // Преобразование данных в формат, понятный React Table
  const data = React.useMemo(() => {
    return columns.map(column => ({
      Field: column.Header,
      Value: discipline.fields[column.accessor]
    }));
  }, [columns, discipline]);

  // Определение колонок
  const tableColumns = React.useMemo(() => [
    {
      Header: 'Field',
      accessor: 'Field'
    },
    {
      Header: 'Value',
      accessor: 'Value'
    }
  ], []);

  // Использование хука useTable для создания таблицы
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns: tableColumns,
    data
  });

  // Рендеринг компонента
  return (
    <div style={{fontFamily: '"Roboto Flex", sans-serif'}}>
     
      <Table striped bordered hover {...getTableProps()}>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <React.Fragment key={cell.getCellProps().key}>
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  </React.Fragment>
                ))}
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default Itemtable;
