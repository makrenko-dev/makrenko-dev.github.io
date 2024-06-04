import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from './datatable';
import fetchDataFromAirtable from './database';

const AvailableDisciplines = ({ tableName, tableColumns, username }) => {
  const [data, setData] = useState([]);
  const [userCourse, setUserCourse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получение данных о пользователе из Airtable
        const users = await fetchDataFromAirtable('Users');
        
        // Поиск пользователя с введенным логином
        const user = users.find(user => user.fields.UserLog === username);
        
        // Если пользователь найден, сохраняем его курс
        if (user) {
          const userCourse = user.fields.StudCourse;
          setUserCourse(userCourse);

          // Получение данных о дисциплинах
          const records = await fetchDataFromAirtable(tableName);

          // Фильтрация дисциплин по курсу пользователя
          const filteredRecords = records.filter(record => {
            const courses = record.fields.DCourse.split(';').map(Number);
            return courses.includes(Number(userCourse));
          });

          // Преобразуем данные в массив объектов для отображения в таблице
          const formattedData = filteredRecords.map(record => ({
            DName: record.fields.DName,
            DCode: record.fields.DCode,
            DCourse: record.fields.DCourse,
            DDesc: record.fields.DDesc,
            BMore: <Link to={`/student/available/${record.id}`}>Детальніше</Link>,
          }));

          setData(formattedData);

          // Вывод количества курсов в консоль
          console.log(`Количество курсов для пользователя: ${filteredRecords.length}`);
        } else {
          console.log('Пользователь не найден или неверные учетные данные.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [tableName, username]);

  return (
    <div style={{ marginLeft: '30px', padding: '20px', paddingTop: '60px', width:'95%'}}>
      <h1>ДОСТУПНІ ДИСЦИПЛІНИ</h1>
      <DataTable data={data} columns={tableColumns} />
    </div>
  );
};

export default AvailableDisciplines;
