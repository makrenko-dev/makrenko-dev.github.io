import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import fetchDataFromAirtable from './database'; // Путь к вашему файлу с функцией fetchDataFromAirtable
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = ({ loggedIn, onLogin, userType }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Получение данных о пользователе из Airtable
      const users = await fetchDataFromAirtable('Users');
      
      // Поиск пользователя с введенным логином и паролем и типом пользователя
      const user = users.find(user => user.fields.UserLog === username && user.fields.UserPassword === password && user.fields.UserType === userType);
      
      // Если пользователь найден, вызовите функцию onLogin с именем пользователя
      if (user) {
        toast.success('Успішно ввійшли');
        onLogin(username, password, userType);
        // Redirect based on userType
        if (userType === 'Student') {
          navigate('/student/available');
        } else if (userType === 'Teacher') {
          navigate('/teacher/mydisciplines');
        } else if (userType === 'Admin') {
          navigate('/admin/users');
        }
      } else {
       toast.error('Невірний логін або пароль');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
    }
  };

  if (loggedIn) {
    return null;
  }

  return (
    <div>
    <Container>
      <Row className="justify-content-center mt-5">
        <Col xs={12} md={6}>
          <div className="text-center">
            <h2>{userType === 'Student' ? 'Вхід для студента' : userType === 'Teacher' ? 'Вхід для викладача' : 'Вхід для адміністратора'}</h2>
          </div>
          <br/>
          <Form>
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Ім'я користувача</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите имя пользователя"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </Form.Group>

            <br/>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </Form.Group>

            <br/>

            <div className="text-center">
              <Button variant="primary" onClick={handleLogin}>
                Авторизуватися
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
     <ToastContainer hideProgressBar={true} />
    </div>
  );
};

export default LoginForm;
