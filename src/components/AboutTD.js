import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Itemtable from './itemtable';
import DataTable from './datatable';
import fetchDataFromAirtable from './database';
import fetchTeacherFromAirtable from './datauser';
import Button from 'react-bootstrap/Button';
import './AboutAD.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './confirmmessage.css';
import ClipLoader from 'react-spinners/ClipLoader';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API_KEY = 'patJCqmyhev9WOlAq.da66f9ddb72dfca2197107cf7df5a9d95a94a6242a62571db634fe0b475c138e';
const BASE_ID = 'appwbTOhoNrrmY2iM';

const AboutAD = ({ username }) => {
  const [discipline, setDiscipline] = useState(null);
  const [students, setStudents] = useState(null);
  const [columns, setColumns] = useState([]);
  const [columnss, setColumnss] = useState([]);
  const [teacherNames, setTeacherNames] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchDiscipline = async () => {
      try {
        const users = await fetchDataFromAirtable('Users');
        const user = users.find(user => user.fields.UserLog === username);

        if (user) {
          const userCourse = user.fields.StudCourse;

          const records = await fetchDataFromAirtable('Disciplines');
          const foundDiscipline = records.find(record => record.id === id);
          setDiscipline(foundDiscipline);

          if (foundDiscipline && foundDiscipline.fields) {
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

            const newColumns = Object.keys(selectedFields).map(fieldName => ({
              Header: selectedFields[fieldName],
              accessor: fieldName,
            }));

            setColumns(newColumns);
            console.log(foundDiscipline.fields.DTeacher)
            if (foundDiscipline.fields.DTeacher) {
              const teacherIDs = foundDiscipline.fields.DTeacher;
              const teacherPromises = teacherIDs.map(teacherID => fetchTeacherFromAirtable('Users', teacherID));
              const teachers = await Promise.all(teacherPromises);
              const teacherNames = teachers.map(teacher => teacher.fields.UserName);
              setTeacherNames(teacherNames);
              console.log('1',teacherNames)
            }

            if (foundDiscipline.fields.DDesc) {
              const preStyle = {
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: 'inherit',
              };
              foundDiscipline.fields.DDesc = <pre style={preStyle}>{foundDiscipline.fields.DDesc}</pre>;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching discipline data:', error);
      }
    };

    fetchDiscipline();
  }, [id, username]);

  useEffect(() => {
    const fetchStudD = async () => {
      try {
        const students = await fetchDataFromAirtable('UserCourses');
        if (!discipline || !discipline.fields) return;

        const disciplineID = discipline.fields.DisciplineID;

        const fetchDataAndUpdateDiscipline = async (student) => {
          if (student.fields && student.fields.DisciplineID) {
            const disciplineRecordId = student.fields.DisciplineID[0];
            const disciplineRecord = await fetchTeacherFromAirtable('Disciplines', disciplineRecordId);
            if (disciplineRecord && disciplineRecord.fields) {
              student.fields.DisciplineID = disciplineRecord.fields.DisciplineID;
            }
          }
          return student;
        };

        const studr = await Promise.all(students.map(fetchDataAndUpdateDiscipline));

        const studentsWithDisciplineID = studr.filter(student => student !== null);

        const filteredStudents = studentsWithDisciplineID.filter(student =>
          student.fields.DisciplineID === disciplineID && student.fields.Registered === true
        );

        const users = await fetchDataFromAirtable('Users');

        const fetchID = async (student) => {
          if (student.fields && student.fields.UserID && users.length) {
            const usrecid = student.fields.UserID[0];
            const usrec = await fetchTeacherFromAirtable('Users', usrecid); 
            if (usrec && usrec.fields) {
              student.fields.UserID = usrec.fields.UserID;
            }
          }
          return student;
        };

        const studid = await Promise.all(filteredStudents.map(fetchID));

        const studentsWithID = studid.filter(student => student !== null);

        const filteredUserNames = users.filter(user =>
          studentsWithID.some(student => student.fields.UserID === user.fields.UserID)
        );

        setStudents(filteredUserNames);

        if (filteredUserNames.length > 0) {
          const studFields = {
            'fields.UserName': 'Прізвище',
            'fields.StudGroup': 'Група',
            'fields.StudCourse': 'Курс',
          };

          const newColumns = Object.keys(studFields).map(fieldName => ({
            Header: studFields[fieldName],
            accessor: fieldName,
          }));

          setColumnss(newColumns);
        } else {
          setStudents([{ UserName: 'Поки що немає жодного записаного студента' }]);
          setColumnss([{ Header: 'Записані на цю дисциплину студенти', accessor: 'UserName' }]);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    fetchStudD();
  }, [id, discipline]);

  const downloadExcel = () => {
    if (!students || students.length === 0 || students[0].UserName === 'Поки що немає жодного записаного студента') return;

    const ws = XLSX.utils.json_to_sheet(students.map(student => ({
      'Прізвище': student.fields.UserName,
      'Група': student.fields.StudGroup,
      'Курс': student.fields.StudCourse
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileName = `${discipline.fields.DName}_students.xlsx`;
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
  };

  if (!discipline || columns.length === 0 || !students) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader color={'#123abc'} loading={true} size={50} />
      </div>
    );
  }

  const isDownloadButtonDisabled = !students || students.length === 0 || students[0].UserName === 'Поки що немає жодного записаного студента';
  console.log(teacherNames)
  // Обновляем данные для отображения преподавателей на новых строках
  const updatedDiscipline = {
    ...discipline,
    fields: {
      ...discipline.fields,
      UDTeacher: (
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 'inherit' }}>
          {teacherNames.join('\n')}
        </div>
      )
    }
  };

  return (
    <div style={{ marginLeft: '30px', padding: '20px', paddingTop: '60px', width: '95%' }}>
      {discipline.fields.DName && <h2 className='h2ad'>{discipline.fields.DName}</h2>}
      {console.log(updatedDiscipline)}
      <Itemtable discipline={updatedDiscipline} columns={columns} />
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent:'space-between' }}>
        <h4 className='h4ad' style={{ marginRight: '20px' }}>Cписок студентів, які записалися:</h4>
        <Button onClick={downloadExcel} variant="primary" disabled={isDownloadButtonDisabled}>Завантажити таблицю</Button>
      </div>
      <DataTable data={students} columns={columnss} />
      <ToastContainer hideProgressBar={true} />
    </div>
  );
};

export default AboutAD;
