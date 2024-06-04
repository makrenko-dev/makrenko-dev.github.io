import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Itemtable from './itemtable';
import fetchDataFromAirtable from './database';
import fetchTeacherFromAirtable from './datauser';

const ContentD = () => {
  const [discipline, setDiscipline] = useState(null);
  const [columns, setColumns] = useState([]);
  const [teacherName, setTeacherName] = useState(null); // State для имени учителя
  const { id } = useParams();

useEffect(() => {
  const fetchDiscipline = async () => {
    try {
      const records = await fetchDataFromAirtable('Disciplines');
      const foundDiscipline = records.find(record => record.id === id);
      setDiscipline(foundDiscipline);

      if (foundDiscipline && foundDiscipline.fields) {
        // Объект с выбранными полями и их заголовками
        const selectedFields = {
          DName: 'Назва дисципліни',
          DCode: 'Код дисципліни',
          DKafedra: 'Кафедра',
          UDTeacher: 'Викладач дисципліни',
          DDesc: 'Опис дисципліни',
          DCourse: 'Курси, для яких доступна',
          DSemestr: 'Семестри вкладання(відповідно)',  
          DMax: 'Максимальна кількість здобувачів',
          DMin: 'Мінімальна кількість здобувачів',
        };

        // Создаем массив колонок на основе выбранных полей и их заголовков
        const newColumns = Object.keys(selectedFields).map(fieldName => ({
          Header: selectedFields[fieldName],
          accessor: fieldName,
        }));

        setColumns(newColumns);

        if (foundDiscipline.fields.TeacherID) {
          const teacherID = foundDiscipline.fields.TeacherID;
          const teacher = await fetchDataFromAirtable('Users', teacherID); // Предполагается, что fetchDataFromAirtable возвращает данные по ID
          if (teacher && teacher.fields && teacher.fields.UserName) {
            setTeacherName(teacher.fields.UserName);
          }
        }

        // Форматирование описания дисциплины
       if (foundDiscipline.fields.DDesc) {
          const preStyle = {
            whiteSpace: 'pre-wrap', // сохранение переносов строк
            fontFamily: 'inherit', // наследование шрифта от родительского элемента
            fontSize: 'inherit',
          };
          foundDiscipline.fields.DDesc = <pre style={preStyle}>{foundDiscipline.fields.DDesc}</pre>;
        }

      }
    } catch (error) {
      console.error('Error fetching discipline data:', error);
    }
  };

  fetchDiscipline();
}, [id]);



  if (!discipline || columns.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ marginLeft: '30px', padding: '20px',paddingTop: '60px', width: '95%' }}>
      {discipline.fields.DName &&  <h2>{discipline.fields.DName}</h2>}
      <Itemtable discipline={discipline} columns={columns} />
    </div>
  );
};

export default ContentD;

