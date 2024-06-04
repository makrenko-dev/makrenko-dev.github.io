import React, { useState, useEffect } from 'react';
import { updateRecord, addRecord, deleteRecord, fetchAllDisciplines } from './database';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ADisciplines.css'; // Для дополнительных стилей

const DisciplineEditor = () => {
  const [disciplines, setDisciplines] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [formFields, setFormFields] = useState({
    DName: '',
    DCode: '',
    DCourse: '',
    DSemestr: '',
    DKafedra: '', // Изменено на DKafedra
    DMax: '',
    DMin: ''
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllDisciplines()
      .then(disciplines => {
        setDisciplines(disciplines);
      })
      .catch(error => {
        console.error('Error fetching disciplines:', error);
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteRecord('Disciplines', id);
      setDisciplines(disciplines.filter(discipline => discipline.id !== id));
      toast.success('Дисципліну успішно видалено');
    } catch (error) {
      console.error('Error deleting discipline:', error);
      toast.error('Помилка при видаленні дисципліни');
    }
  };

  const handleAdd = async () => {
  try {
    // Проверяем и устанавливаем значение по умолчанию для DMax и DMin
    const newFields = {
      ...formFields,
      DMax: formFields.DMax === '' ? 0 : parseInt(formFields.DMax),
      DMin: formFields.DMin === '' ? 0 : parseInt(formFields.DMin)
    };

    const newRecord = await addRecord('Disciplines', newFields);
    setDisciplines([...disciplines, newRecord]);
    setFormFields({
      DName: '',
      DCode: '',
      DCourse: '',
      DSemestr: '',
      DKafedra: '',
      DMax: '',
      DMin: ''
    });
    setShowModal(false);
    toast.success('Дисципліну успішно додано');
  } catch (error) {
    console.error('Error adding discipline:', error);
    toast.error('Помилка при додаванні дисципліни');
  }
};


  const handleUpdate = async () => {
    try {
      const updatedRecord = await updateRecord('Disciplines', selectedDiscipline.id, formFields);
      setDisciplines(disciplines.map(discipline => (discipline.id === updatedRecord.id ? updatedRecord : discipline)));
      setSelectedDiscipline(null);
      setFormFields({
        DName: '',
        DCode: '',
        DCourse: '',
        DSemestr: '',
        DKafedra: '',
        DMax: '',
        DMin: ''
      });
      setShowModal(false);
      toast.success('Дисципліну успішно оновлено');
    } catch (error) {
      console.error('Error updating discipline:', error);
      toast.error('Помилка при оновленні дисципліни');
    }
  };

  const openEditModal = (discipline) => {
    setSelectedDiscipline(discipline);
    setFormFields(discipline.fields);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDiscipline(null);
    setFormFields({
      DName: '',
      DCode: '',
      DCourse: '',
      DSemestr: '',
      DKafedra: '',
      DMax: '',
      DMin: ''
    });
  };


const handleChange = (e) => {
  const { name, value } = e.target;
  let numericValue = value; // По умолчанию присваиваем значение value

  // Если значение пустое и поле является числовым, устанавливаем значение 0
  if ((name === 'DMax' || name === 'DMin') && value === '') {
    numericValue = 0;
  } else if (name === 'DMax' || name === 'DMin') {
    // Если значение не пустое и поле является числовым, преобразуем его в число
    numericValue = parseInt(value);
  }

  setFormFields(prevState => ({
    ...prevState,
    [name]: numericValue
  }));
};

 const handleCourseChange = (e) => {
    const value = e.target.value;
    if (/^[0-9;]*$/.test(value) || value === '') {
      setFormFields({ ...formFields, DCourse: value });
    }
  };

 const handleSemesterChange = (e) => {
  const value = e.target.value;
  if (/^[а-яА-ЯіїІЇєЄёЁ;]*$/.test(value) || value === '') {
    setFormFields({ ...formFields, DSemestr: value });
  }
};

  return (
    <div className="discipline-editor">
      <ToastContainer hideProgressBar={true} />
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '30px', marginTop: '30px' }}>
        <h2>Редагування, додавання та видалення дисциплін</h2>
        <Button onClick={() => setShowModal(true)}>Додати дисципліну</Button>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Назва</th>
            <th>Код</th>
            <th>Курс</th>
            <th>Семестр</th>
            <th>Кафедра</th>

            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {disciplines.map(discipline => (
            <tr key={discipline.id}>
              <td>{discipline.fields.DName}</td>
              <td>{discipline.fields.DCode}</td>
              <td>{discipline.fields.DCourse}</td>
              <td>{discipline.fields.DSemestr}</td>
              <td>{discipline.fields.DKafedra}</td>
             
              <td className="action-buttons">
                <Button variant="warning" onClick={() => openEditModal(discipline)}>Редагувати</Button>
                <Button variant="danger" onClick={() => handleDelete(discipline.id)}>Видалити</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedDiscipline ? 'Редагувати дисципліну' : 'Додати нову дисципліну'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Назва дисципліни</label>
            <input 
              type="text" 
              name="DName"
              value={formFields.DName} 
              onChange={handleChange} 
              className="form-control"
              placeholder="Назва дисципліни"
            />
          </div>
          <div className="form-group">
            <label>Код дисципліни</label>
            <input 
              type="text" 
              name="DCode"
              value={formFields.DCode} 
              onChange={handleChange} 
              className="form-control"
              placeholder="Код дисципліни"
            />        
          </div>
          
           <div className="form-group">
              <label>Курс викладання(3 або 2;3)</label>
              <input
                type="text"
                name="DCourse"
                value={formFields.DCourse}
                onChange={handleCourseChange}
                className="form-control"
                placeholder="Курс"
              />
            </div>

            <div className="form-group">
              <label>Cеместр викладання(парний або парний;обидва)</label>
              <input
                type="text"
                name="DSemestr"
                value={formFields.DSemestr}
                onChange={handleSemesterChange}
                className="form-control"
                placeholder="Семестр"
              />
            </div>
          
         <div className="form-group">
          <label>Кафедра</label>
          <select 
            name="DKafedra"
            value={formFields.DKafedra} 
            onChange={handleChange} 
            className="form-control"
          >
            <option value="">Виберіть кафедру</option>
            <option value="Математичного забезпечення ЕОМ">Математичного забезпечення ЕОМ</option>
            <option value="Комп’ютерних технологій">Комп’ютерних технологій</option>
            <option value="Обчислювальної математики та математичної кібернетики">Обчислювальної математики та математичної кібернетики</option>
          </select>
        </div>

          
          <div className="form-group">
            <label>Максимальна кількість здобувачів</label>
            <input 
              type="number" 
              name="DMax"
              value={formFields.DMax} 
              onChange={handleChange} 
              className="form-control"
              placeholder="Максимальна кількість здобувачів"
            />
          </div>
          
          <div className="form-group">
            <label>Мінімальна кількість здобувачів</label>
            <input 
              type="number" 
              name="DMin"
              value={formFields.DMin} 
              onChange={handleChange} 
              className="form-control"
              placeholder="Мінімальна кількість здобувачів"
            />
          </div>
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Закрити</Button>
          <Button variant="primary" onClick={selectedDiscipline ? handleUpdate : handleAdd}>
            {selectedDiscipline ? 'Зберегти' : 'Додати'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DisciplineEditor;
