import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Itemtable from './itemtable';
import DataTable from './datatable';
import fetchDataFromAirtable from './database';
import fetchTeacherFromAirtable from './datauser';
import axios from 'axios';
import './AboutAD.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import './confirmmessage.css';
import ClipLoader from 'react-spinners/ClipLoader';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

const API_KEY = 'patJCqmyhev9WOlAq.da66f9ddb72dfca2197107cf7df5a9d95a94a6242a62571db634fe0b475c138e';
const BASE_ID = 'appwbTOhoNrrmY2iM';

const AboutAD = ({ username }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [discipline, setDiscipline] = useState(null);
  const [students, setStudents] = useState(null);
  const [columns, setColumns] = useState([]);
  const [columnss, setColumnss] = useState([]);
  const [teacherName, setTeacherName] = useState(null);
  const [isEnrollDisabled, setIsEnrollDisabled] = useState(false);
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

            if (foundDiscipline.fields.TeacherID) {
              const teacherID = foundDiscipline.fields.TeacherID;
              const teacher = await fetchDataFromAirtable('Users', teacherID);
              if (teacher && teacher.fields && teacher.fields.UserName) {
                setTeacherName(teacher.fields.UserName);
              }
            }

            if (foundDiscipline.fields.DDesc) {
              const preStyle = {
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: 'inherit',
              };
              foundDiscipline.fields.DDesc = <pre style={preStyle}>{foundDiscipline.fields.DDesc}</pre>;
            }

            if (foundDiscipline.fields.DCourse && foundDiscipline.fields.DSemestr) {
              const courseValues = foundDiscipline.fields.DCourse.split(';');
              const semestrValues = foundDiscipline.fields.DSemestr.split(';');
              if (courseValues.length > 1) {
                if (courseValues[0] === userCourse) {
                  foundDiscipline.fields.DCourse = userCourse;
                  foundDiscipline.fields.DSemestr = semestrValues[0];
                } else {
                  foundDiscipline.fields.DCourse = userCourse;
                  foundDiscipline.fields.DSemestr = semestrValues[1];
                }
              } else {
                foundDiscipline.fields.DCourse = userCourse;
              }
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

  useEffect(() => {
    if (discipline && discipline.fields && students) {
      const enrolledCount = students.length;
      const maxCapacity = discipline.fields.DMax || Infinity;
      setIsEnrollDisabled(enrolledCount >= maxCapacity);
    }
  }, [students, discipline]);

  const handleAddToFavorites = async () => {
    try {
      const users = await fetchDataFromAirtable('Users');
      const user = users.find(user => user.fields.UserLog === username);

      if (user && discipline && discipline.fields) {
        const userID = user.fields.UserID;

        let records = await fetchDataFromAirtable('UserCourses');
        records = await Promise.all(records.map(async (record) => {
          if (record.fields && record.fields.UserID) {
            const userrecid = record.fields.UserID[0];
            const userrec = await fetchTeacherFromAirtable('Users', userrecid);
            if (userrec && userrec.fields) {
              record.fields.UserID = userrec.fields.UserID;
            }
          }
          return record;
        }));

        const userLikes = records.filter(record => record.fields.UserID === userID && record.fields.Preference === true);

        const alreadyLiked = userLikes.some(record => {
          const disciplineIDs = record.fields.DisciplineID;
          if (Array.isArray(disciplineIDs)) {
            return disciplineIDs.includes(discipline.id);
          } else {
            return false;
          }
        });

        if (alreadyLiked) {
          toast.warning('Ця дисципліна вже є у ваших вподобайках.');
          return;
        }

        const newRecord = {
          fields: {
            UserID: [user.id],
            DisciplineID: [discipline.id],
            Preference: true,
          },
        };

        const response = await axios.post(`https://api.airtable.com/v0/${BASE_ID}/UserCourses`, newRecord, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status !== 200) {
          throw new Error(`Error adding record: ${response.statusText}`);
        }

        toast.success('Дисципліну додано до вподобайок');
      }
    } catch (error) {
      toast.error('Помилка при додаванні до вподобайок');
    }
  };

  const handleEnroll = async () => {
    try {
      const users = await fetchDataFromAirtable('Users');
      const user = users.find(user => user.fields.UserLog === username);

      if (user && discipline && discipline.fields) {
        const userID = user.fields.UserID;

        let enrollments = await fetchDataFromAirtable('UserCourses');
        enrollments = await Promise.all(enrollments.map(async (enrollment) => {
          if (enrollment.fields && enrollment.fields.UserID) {
            const userrecid = enrollment.fields.UserID[0];
            const userrec = await fetchTeacherFromAirtable('Users', userrecid);
            if (userrec && userrec.fields) {
              enrollment.fields.UserID = userrec.fields.UserID;
            }
          }
          return enrollment;
        }));

        const userEnrollments = enrollments.filter(enrollment =>
          enrollment.fields.UserID === userID && enrollment.fields.Registered === true
        );

        if (userEnrollments.length >= 2) {
          toast.warning('Ви вже зареєстровані на 2 дисципліни, більше записуватися не можна.');
          return;
        }

        const alreadyEnrolled = userEnrollments.some(enrollment => Array.isArray(enrollment.fields.DisciplineID) && enrollment.fields.DisciplineID.includes(discipline.id));

        if (alreadyEnrolled) {
          toast.warning('Ви вже записані на цю дисципліну.');
          return;
        }

        confirmAlert({
          title: 'Підтвердження запису',
          message: 'Ви впевнені, що хочете записатися на цю дисципліну?',
          buttons: [
            {
              label: 'Так',
              onClick: async () => {
                try {
                  const newRecord = {
                    fields: {
                      UserID: [user.id],
                      DisciplineID: [discipline.id],
                      Registered: true,
                    },
                  };

                  const response = await axios.post(`https://api.airtable.com/v0/${BASE_ID}/UserCourses`, newRecord, {
                    headers: {
                      Authorization: `Bearer ${API_KEY}`,
                      'Content-Type': 'application/json',
                    },
                  });

                  if (response.status !== 200) {
                    throw new Error(`Error enrolling: ${response.statusText}`);
                  }
                  toast.success('Ви успішно записалися на дисципліну');
                } catch (error) {
                  toast.error('Помилка при записі на дисципліну');
                  console.error('Error enrolling:', error);
                }
              }
            },
            {
              label: 'Ні',
              onClick: () => {
                toast.info('Запис скасовано');
              }
            }
          ]
        });
      }
    } catch (error) {
      toast.error('Помилка при записі на дисципліну');
      console.error('Error enrolling:', error);
    }
  };

  if (!discipline || columns.length === 0 || !students) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader color={'#123abc'} loading={true} size={50} />
      </div>
    );
  }

  const calculateProgressBar = () => {
    let progressColor = '';
    let progressText = '';
    let minCapacityText = '';

    if (!discipline || !discipline.fields || !students) {
      return { progressColor, progressText, minCapacityText };
    }

    const enrolledCount = students.length;
    const maxCapacity = discipline.fields.DMax || Infinity;
    const minCapacity = discipline.fields.DMin || 0;

   const enrollmentText = maxCapacity !== Infinity ? `${enrolledCount}/${maxCapacity} (${isEnrollDisabled ? 'Набір закрито' : 'Набір відкрито'})` : `${enrolledCount}/`;


    if (enrolledCount < minCapacity) {
      progressColor = 'yellow';
      progressText = enrollmentText;
      minCapacityText = `Мінімальна кількість здобувачів: ${minCapacity}`;
    } else if (enrolledCount < maxCapacity) {
      progressColor = 'green';
      progressText = enrollmentText;
    } else {
      progressColor = 'red';
      progressText = enrollmentText;
    }

    return { progressColor, progressText, minCapacityText };
  };

  const { progressColor, progressText, minCapacityText } = calculateProgressBar();

  return (
    <div style={{ marginLeft: '30px', padding: '20px', paddingTop: '60px', width: '95%' }}>
      {discipline.fields.DName && <h2 className='h2ad'>{discipline.fields.DName}</h2>}
      <div style={{ marginBottom: '20px', marginTop: '20px' }}>
        <Button className="btnad" onClick={handleAddToFavorites} variant="outline-info">Додати до вподобайок</Button>{' '}
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="enrollTooltip" className={isEnrollDisabled ? 'tooltip-disabled' : ''}>
                {isEnrollDisabled ? 'Ліміт студентів досягнуто' : ''}
              </Tooltip>
            }
          >
         <Button
          className={`btnad ${isEnrollDisabled ? 'disabled-button' : ''}`}
          onClick={isEnrollDisabled ? null : handleEnroll}
          variant="outline-info"
        >
          Записатися
        </Button>



    </OverlayTrigger>
      </div>
      <Itemtable discipline={discipline} columns={columns} />
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div className="progress" style={{ height: '40px', fontSize: '16px', position: 'relative' }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${students.length > 0 ? (students.length * 100) / discipline.fields.DMax : 0}%`, backgroundColor: progressColor }}
            aria-valuenow={students.length}
            aria-valuemin="0"
            aria-valuemax={discipline.fields.DMax}
          >
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'black', fontWeight: 'bold' }}>{progressText}</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '14px', color: 'black' }}>{minCapacityText}</div>
      </div>
      <h4 className='h4ad'>Cписок студентів, які записалися:</h4>
      <DataTable data={students} columns={columnss} />
      <ToastContainer hideProgressBar={true} />
    </div>
  );
};

export default AboutAD;
