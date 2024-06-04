import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import DataTable from './datatable';
import fetchDataFromAirtable from './database';
import fetchTeacherFromAirtable from './datauser';
import './AboutAD.css';

const Favourites = ({ username }) => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const { id } = useParams();

  useEffect(() => {
    const fetchDiscipline = async () => {
      try {
        const users = await fetchDataFromAirtable('Users');
        const user = users.find(user => user.fields.UserLog === username);

        if (user) {
          const userID = user.fields.UserID;
          const userCourse = user.fields.StudCourse;

          const records = await fetchDataFromAirtable('UserCourses');

          const fetchDataAndUpdateID = async (record) => {
            if (record.fields && record.fields.UserID && record.fields.DisciplineID) {
              const userrecid = record.fields.UserID[0];
              const userrecdis = record.fields.DisciplineID[0];
              const userrec = await fetchTeacherFromAirtable('Users', userrecid);
              const userrec1 = await fetchTeacherFromAirtable('Disciplines', userrecdis);
              if (userrec && userrec.fields) {
                record.fields.UserID = userrec.fields.UserID;
              }
              if (userrec1 && userrec1.fields) {
                record.fields.DisciplineID = userrec1.fields.DisciplineID;
              }
            }
            return record;
          };

          const updatedRecords = await Promise.all(records.map(fetchDataAndUpdateID));

          const userDiscs = updatedRecords.filter(record => record.fields.UserID === userID && record.fields.Registered === true);

          if (userDiscs.length > 0) {
            const disciplines = await fetchDataFromAirtable('Disciplines');

            const formattedData = userDiscs.map(userDisc => {
              const foundDiscipline = disciplines.find(
                dis => dis.fields.DisciplineID === userDisc.fields.DisciplineID
              );

              if (foundDiscipline && foundDiscipline.fields) {
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

                return {
                  'Назва': foundDiscipline.fields.DName,
                  'Код дисципліни': foundDiscipline.fields.DCode,
                  'Курс викладання': foundDiscipline.fields.DCourse,
                  'Семестр викладання': foundDiscipline.fields.DSemestr,
                  Детальніше: <Link to={`/student/available/${foundDiscipline.id}`}>Детальніше</Link>,
                };
              }
              return null;
            }).filter(item => item !== null);

            const newColumns = Object.keys(formattedData[0]).map(fieldName => ({
              Header: fieldName.includes('fields.') ? fieldName.split('.')[1] : fieldName,
              accessor: fieldName,
            }));

            setData(formattedData);
            setColumns(newColumns);
          } else {
            setData([{ UserName: 'Поки що немає запису на жодну дисципліну' }]);
            setColumns([{ Header: 'Дисципліни, на які записалися', accessor: 'UserName' }]);
          }
        }
      } catch (error) {
        console.error('Error fetching discipline data:', error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchDiscipline();
  }, [id, username]);

  return (
    <div style={{ marginLeft: '30px', padding: '20px', paddingTop: '60px', width: '95%' }}>
      <h1>МОЇ ОБРАНІ ДИСЦИПЛІНИ:</h1>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <ClipLoader color={'#123abc'} loading={loading} size={50} />
        </div>
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
};

export default Favourites;
