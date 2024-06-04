import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from './datatable';
import fetchDataFromAirtable from './database';
import fetchTeacherFromAirtable from './datauser';

const TeacherDisciplines = ({ tableName, tableColumns, username }) => {
  const [data, setData] = useState([]);

  const fetchDisciplineByID = async (disciplineId) => {
    try {
      const disciplineRecord = await fetchTeacherFromAirtable('Disciplines', disciplineId);
      return disciplineRecord;
    } catch (error) {
      console.error(`Error fetching discipline with ID ${disciplineId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получение данных о пользователе из Airtable
        const users = await fetchDataFromAirtable('Users');

        // Поиск пользователя с введенным логином
        const user = users.find(user => user.fields.UserLog === username);

        // Если пользователь найден и является преподавателем
        if (user && user.fields.UserType === 'Teacher') {
          console.log(user.fields.Disciplines); // выводим идентификаторы дисциплин для проверки

          // Проверка на наличие дисциплин
          let disciplineIds;
          if (Array.isArray(user.fields.Disciplines)) {
            disciplineIds = user.fields.Disciplines;
          } else {
            disciplineIds = [user.fields.Disciplines];
          }

          // Получение записей дисциплин по идентификаторам
          const disciplineRecords = await Promise.all(
            disciplineIds.map(disciplineId => fetchDisciplineByID(disciplineId))
          );

          // Фильтрация существующих дисциплин
          const validDisciplines = disciplineRecords.filter(discipline => discipline && discipline.fields);

          // Преобразование данных для отображения в таблице
          const formattedData = validDisciplines.map(record => ({
            DName: record.fields.DName,
            DCode: record.fields.DCode,
            DCourse: record.fields.DCourse,
            DDesc: record.fields.DDesc,
            BMore: <Link to={`/teacher/mydisciplines/${record.id}`}>Детальніше</Link>,
          }));

          setData(formattedData);

          console.log(`Количество доступных дисциплин для преподавателя: ${validDisciplines.length}`);
        } else {
          console.log('Пользователь не найден или не является преподавателем.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [tableName, username]);

  return (
    <div style={{ marginLeft: '30px', padding: '20px', paddingTop: '60px', width: '95%' }}>
      <h1>ДОСТУПНІ ДИСЦИПЛІНИ</h1>
      <DataTable data={data} columns={tableColumns} />
    </div>
  );
};

export default TeacherDisciplines;
