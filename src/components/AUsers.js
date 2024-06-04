import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { fetchDataFromAirtable, updateRecord, addRecord, deleteRecord, fetchAllDisciplines } from './database';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminUsers.css';
import fetchTeacherFromAirtable from './datauser';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminUsers = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [disciplinesshow, setDisciplinesShow] = useState([]);
  const [usercourses, setUserCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { register, handleSubmit, reset, control } = useForm();
  const [selectedCourses, setSelectedCourses] = useState([]);

  const fetchUsers = async () => {
    const users = await fetchDataFromAirtable('Users');
    setStudents(users.filter(user => user.fields.UserType === 'Student'));
    setTeachers(users.filter(user => user.fields.UserType === 'Teacher'));
    setAdmins(users.filter(user => user.fields.UserType === 'Admin'));
  };

  const fetchDisciplines = async () => {
    try {
      const disciplines = await fetchAllDisciplines();
      console.log('Fetched disciplines:', disciplines); // Отладочная информация
      setDisciplines(disciplines.map(d => ({
        value: d.id,
        label: `${d.fields.DCode} ${d.fields.DName}` // Формирование строки в нужном формате
      })));
    } catch (error) {
      console.error('Error fetching disciplines:', error);
    }
  };

  const fetchDisciplinesShow = async () => {
    try {
      const disciplinesshow = await fetchAllDisciplines();
      console.log('Fetched show disciplines:', disciplinesshow); // Отладочная информация
      setDisciplinesShow(disciplinesshow);
    } catch (error) {
      console.error('Error fetching disciplines:', error);
    }
  };

  const fetchUserCourses = async () => {
    try {
      const usercourses = await fetchDataFromAirtable('UserCourses');
      setUserCourses(usercourses);
    } catch (error) {
      console.error('Error fetching user courses:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDisciplines();
    fetchDisciplinesShow();
    fetchUserCourses();
  }, []);

const openModal = (user) => {
  setCurrentUser(user);
  console.log('Opening modal for user:', user);

  if (user) {
  const formattedDisciplinesOrCourses = formatDisciplines(user, usercourses, disciplinesshow);

  reset({
    ...user.fields,
    [user.fields.UserType === 'Student' ? 'UserCourses' : 'Disciplines']: formattedDisciplinesOrCourses
  });
} else {
  reset({});
}


  setShowModal(true);
};

const formatDisciplines = (user, usercourses, disciplinesshow) => {
  const userDisciplinesOrCourses = user.fields.UserType === 'Student' ? user.fields.UserCourses : user.fields.Disciplines;
  
  if (!userDisciplinesOrCourses) return [];

  const formattedDisciplinesOrCourses = userDisciplinesOrCourses.map(d => {
    if (user.fields.UserType === 'Student') {
      const course = usercourses.find(course => course.id === d);
      if (!course || !course.fields.DisciplineID || !course.fields.Registered) return null;
      
      const disciplineCodes = course.fields.DisciplineID.map(disciplineId => {
        const discipline = disciplinesshow.find(d => d.id === disciplineId);
        return discipline ? discipline.fields.DCode : '';
      }).join(', ');

      return { value: d, label: disciplineCodes };
    } else {
      const discipline = disciplinesshow.find(discipline => discipline.id === d);
      return { value: d, label: discipline ? discipline.fields.DCode : '' };
    }
  }).filter(discipline => discipline !== null); // Remove null entries

  return formattedDisciplinesOrCourses;
};

const closeModal = () => {
  setCurrentUser(null);
  setShowModal(false);
};

const onSubmit = async (data) => {
  try {
    console.log('Form data:', data);

    if (currentUser && currentUser.fields.UserType === 'Student') {
      // Проверяем количество дисциплин, на которые уже записан студент
      const registeredCourses = (currentUser.fields.UserCourses || []).filter(courseId => {
        const course = usercourses.find(c => c.id === courseId);
        return course && course.fields.Registered;
      });

      // Новые выбранные дисциплины, которых еще нет в списке студента
      const newCourses = data.UserCourses.filter(courseId => !registeredCourses.includes(courseId.value));

      // Проверяем, если текущих и новых курсов больше или равно 2, выводим предупреждение
      if (registeredCourses.length + newCourses.length > 2) {
        toast.warning('Студент вже записаний на 2 дисципліни. Неможна записати на більшу кількість дисциплін.');
        return;
      }

      let newCourseRecords = [];
      // Если есть новые дисциплины, добавляем их в таблицу UserCourses
      for (const course of newCourses) {
        const newRecord = await addRecord('UserCourses', {
          UserID: [currentUser.id], // Добавляем UserID
          DisciplineID: [course.value],
          Preference: false,
          Registered: true
        });
        newCourseRecords.push(newRecord.id);
      }

      // Обновляем данные студента
      const updatedData = {
        ...data,
        UserCourses: [
          ...registeredCourses,
          ...newCourseRecords // Добавляем новые записи UserCourses
        ]
      };

      // Удаляем поле UserCourses из updatedData для обновления записи пользователя
      delete updatedData.UserCourses;

      await updateRecord('Users', currentUser.id, updatedData);
      toast.success('Запис успішно збережений');
    } else {
      // For teachers, map Disciplines to IDs
      if (data.UserType === 'Teacher') {
        data.Disciplines = data.Disciplines.map(d => d.value);
      }

      if (currentUser) {
        await updateRecord('Users', currentUser.id, data);
      } else {
        await addRecord('Users', data);
      }
      
      toast.success('Запис успішно доданий');
    }
    fetchUsers(); // Обновляем список пользователей
    closeModal(); // Закрываем модальное окно
  } catch (error) {
    console.error('Error saving record:', error);
    toast.error('Помилка при збереженні запису');
  }
};





const handleDelete = async (id) => {
  try {
    await deleteRecord('Users', id);
    fetchUsers();
    toast.success('Запис успішно видалено');
  } catch (error) {
    console.error('Error deleting record:', error);
  }
};

const handleRemoveDiscipline = (disciplineId) => {
  const updatedDisciplines = currentUser.fields.Disciplines.filter(discipline => discipline !== disciplineId);
  setCurrentUser(prevUser => ({
    ...prevUser,
    fields: {
      ...prevUser.fields,
      Disciplines: updatedDisciplines
    }
  }));
  reset(prevUser => ({
    ...prevUser,
    Disciplines: updatedDisciplines.map(d => ({ value: d, label: disciplinesshow.find(discipline => discipline.id === d)?.fields.DCode }))
  }));
};

return (
  <div className="admin-users">
    <ToastContainer hideProgressBar={true} />
    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', marginBottom:'30px', marginTop:'30px'}}>
    <h2>Користувачі</h2>
    <Button onClick={() => openModal(null)}>Додати користувача</Button>
    </div>
        {['Student', 'Teacher', 'Admin'].map((type) => (
          <div key={type}>
            <h3>{type === 'Student' ? 'Студенти' : type === 'Teacher' ? 'Вчителі' : 'Адміністратори'}</h3>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Ім'я користувача</th>
                  <th>Логін</th>
                  <th>Пароль</th>
                  <th>Роль</th>
                  {(type === 'Student' || type === 'Teacher') && <th>Дисципліни</th>}
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {(type === 'Student' ? students : type === 'Teacher' ? teachers : admins).map((user) => (
                  <tr key={user.id}>
                    <td>{user.fields.UserName}</td>
                    <td>{user.fields.UserLog}</td>
                    <td>{user.fields.UserPassword}</td>
                    <td>{user.fields.UserType}</td>
                    {(type === 'Student' || type === 'Teacher') && (
                      <td>
                        {type === 'Student' ? (
                          user.fields.UserCourses && disciplinesshow.length > 0 && usercourses.length > 0 && user.fields.UserCourses
                            .filter(courseId => {
                              const course = usercourses.find(d => d.id === courseId);
                              return course && course.fields.Registered === true; // Filter only registered courses
                            })
                            .map(courseId => {
                              const course = usercourses.find(d => d.id === courseId);
                              if (!course) return null; // If course is not found, skip

                              // Handle DisciplineID as an array
                              const disciplineCodes = course.fields.DisciplineID.map(disciplineId => {
                                const discipline = disciplinesshow.find(d => d.id === disciplineId);
                                return discipline ? discipline.fields.DCode : '';
                              });

                              return (
                                <div key={courseId}>{disciplineCodes.join(', ')}</div>
                              );
                            })
                        ) : (
                          user.fields.Disciplines && disciplinesshow.length > 0 && user.fields.Disciplines.map(disciplineId => {
                            const discipline = disciplinesshow.find(d => d.id === disciplineId);
                            const dCode = discipline ? discipline.fields.DCode : '';
                            return (
                              <div key={disciplineId}>{dCode}</div>
                            );
                          })
                        )}
                      </td>
                    )}
                    <td style={{display:'flex',flexDirection:'column'}}>
                      <Button variant="warning" onClick={() => openModal(user)}>Редагувати</Button>
                      <Button variant="danger" onClick={() => handleDelete(user.id)}>Видалити</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>{currentUser ? 'Редактировать пользователя' : 'Добавить пользователя'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Ім'я користувача</label>
            <input type="text" className="form-control" {...register('UserName', { required: true })} />
          </div>
          <div className="form-group">
            <label>Логін</label>
            <input type="email" className="form-control" {...register('UserLog', { required: true })} />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input type="text" className="form-control" {...register('UserPassword', { required: true })} />
          </div>
          <div className="form-group">
            <label>Роль</label>
            <select className="form-control" {...register('UserType', { required: true })}>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          {currentUser && currentUser.fields.UserType === 'Teacher' && (
            <div className="form-group">
              <label>Дисципліни</label>
              <Controller
                name="Disciplines"
                control={control}
                render={({ field }) => {
                  const selectedDisciplines = currentUser.fields.Disciplines || [];
                  const availableDisciplines = disciplines.filter(d => !selectedDisciplines.includes(d.value));
                  return (
                    <Select
                      {...field}
                      options={availableDisciplines}
                      isMulti
                    />
                  );
                }}
              />
            </div>
          )}
          {currentUser && currentUser.fields.UserType === 'Student' && (
            <>
            <div className="form-group">
              <label>Дисципліни</label>
              <Controller
                name="UserCourses"
                control={control}
                render={({ field }) => {
                  const selectedCourses = currentUser.fields.UserCourses || [];
                  const registeredDisciplines = selectedCourses.flatMap(courseId => {
                    const course = usercourses.find(course => course.id === courseId);
                    return course ? course.fields.DisciplineID : [];
                  });
                  const availableDisciplines = disciplinesshow
                    .filter(discipline => !registeredDisciplines.includes(discipline.id));
                  console.log('availableDisciplines', availableDisciplines);
                  return (
                    <Select
                      {...field}
                      options={availableDisciplines.map(discipline => ({
                        value: discipline.id,
                        label: `${discipline.fields.DCode} ${discipline.fields.DName}`
                      }))}
                      isMulti
                    />
                  );
                }}
              />
            </div>
            <div className="form-group">
              <label>Курс</label>
               <input
              type="number"
              className="form-control"
              {...register('StudCourse', {
                required: true,
                valueAsNumber: true // Преобразуем значение в число
              })}
            />
            </div>
            <div className="form-group">
              <label>Група</label>
              <input type="text" className="form-control" {...register('StudGroup', { required: true })} />
           </div>
            </>
          )}

          <Button type="submit" variant="primary">Зберегти</Button>
        </form>
      </Modal.Body>
    </Modal>
  </div>
);
};

export default AdminUsers;
