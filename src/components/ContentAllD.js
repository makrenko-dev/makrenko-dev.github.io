// AirtableData.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from './datatable';
import fetchDataFromAirtable from './database';

const AirtableData = ({ tableName, tableColumns }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const records = await fetchDataFromAirtable(tableName);
        // Преобразуем данные в массив объектов для отображения в таблице
        const formattedData = records.map(record => ({
          // Здесь добавляем ключи для каждого поля таблицы и соответствующие значения
          DName: record.fields.DName,
          DCode: record.fields.DCode,
          DCourse: record.fields.DCourse,
          DDesc: record.fields.DDesc,
          BMore: <Link to={`/discipline/${record.id}`}>Детальніше</Link>,
          // Добавьте остальные поля здесь
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [tableName]);

  return (
    <div style={{ marginLeft: '30px', padding: '20px',paddingTop: '60px', width:'95%'}}>
      <h1>ВСІ ДИСЦИПЛІНИ</h1>
      <DataTable data={data} columns={tableColumns} />
    </div>
  );
};

export default AirtableData;
