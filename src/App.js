import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/SideBar';
import Content from './components/ContentM';
import Contacts from './components/Contacts';
import About from './components/ContentA';
import AboutAD from './components/AboutAD';
import AboutTD from './components/AboutTD';
import AllD from './components/ContentAllD';
import ContentD from './components/DisciplinePage';
import NavbarforLogged from './components/NavbarforLogged';
import Favourites from './components/Favourites';
import StudDisc from './components/StudDisc';
import AvailableDisciplines from './components/AvailableDisciplines';
import TeacherDisciplines from './components/TeacherDisciplines';
import LoginForm from './components/LoginForm';
import AUsers from './components/AUsers';
import ADisciplines from './components/ADisciplines';


const AppContent = ({ loggedInStudent, loggedInTeacher, loggedInAdmin, onLogin, onLogout, userCredentials }) => {
  const location = useLocation();

  const showLoggedNavbar = () => {
    return location.pathname.startsWith('/student') || location.pathname.startsWith('/teacher') || location.pathname.startsWith('/admin');
  };

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', height: '100%', backgroundColor: '#EFF3FF' }}>
        <Sidebar 
          loggedInStudent={loggedInStudent} 
          loggedInTeacher={loggedInTeacher} 
          loggedInAdmin={loggedInAdmin} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: '#EFF3FF' }}>
          {(loggedInStudent || loggedInTeacher || loggedInAdmin) && showLoggedNavbar() && <NavbarforLogged onLogout={onLogout} loggedInStudent={loggedInStudent} 
          loggedInTeacher={loggedInTeacher} 
          loggedInAdmin={loggedInAdmin}/>}
          <Routes>
            <Route path="/" element={<Content />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/loginstudent" element={<LoginForm loggedIn={loggedInStudent} onLogin={onLogin} userType="Student" />} />
            <Route path="/loginteacher" element={<LoginForm loggedIn={loggedInTeacher} onLogin={onLogin} userType="Teacher" />} />
            <Route path="/loginadmin" element={<LoginForm loggedIn={loggedInAdmin} onLogin={onLogin} userType="Admin" />} />
            <Route path="/alldisciplines" element={<AllD tableName="Disciplines" tableColumns={[
              { Header: 'Назва дисципліни', accessor: 'DName' },
              { Header: 'Код дисципліни', accessor: 'DCode' },
              { Header: 'Про дисципліну', accessor: 'BMore' },
            ]} />} />
            <Route path="/discipline/:id" element={<ContentD />} />
            {(loggedInStudent || loggedInTeacher || loggedInAdmin) ? (
              <>
                {loggedInStudent && (
                  <>
                    <Route path="/student/available" element={<AvailableDisciplines tableName="Disciplines" tableColumns={[
                      { Header: 'Назва дисципліни', accessor: 'DName' },
                      { Header: 'Код дисципліни', accessor: 'DCode' },
                      { Header: 'Про дисципліну', accessor: 'BMore' },
                    ]} username={userCredentials.username} />} />
                    <Route path="/student/available/:id" element={<AboutAD username={userCredentials.username} />} />
                    <Route path="/student/likes" element={<Favourites username={userCredentials.username} />} />
                    <Route path="/student/mydisciplines" element={<StudDisc username={userCredentials.username} />} />
                  </>
                )}
                {loggedInTeacher && (
                  <>
                  <Route path="/teacher" element={<div>Teacher Page</div>} />
                  <Route path="/teacher/mydisciplines" element={<TeacherDisciplines tableName="Disciplines" tableColumns={[
                      { Header: 'Назва дисципліни', accessor: 'DName' },
                      { Header: 'Код дисципліни', accessor: 'DCode' },
                      { Header: 'Про дисципліну', accessor: 'BMore' },
                    ]} username={userCredentials.username} />} />
                  <Route path="/teacher/mydisciplines/:id" element={<AboutTD username={userCredentials.username} />} />
                  </>

                )}

                {loggedInAdmin && (
                  <>
                  <Route path="/admin/users" element={<AUsers />} />
                  <Route path="/admin/disciplines" element={<ADisciplines />} />
                  </>
                )}
              </>
            ) : (
              <>
                <Route path="/student/available" element={<Navigate to="/alldisciplines" replace />} />
                <Route path="/student/available/:id" element={<Navigate to="/alldisciplines" replace />} />
                <Route path="/student/likes" element={<Navigate to="/alldisciplines" replace />} />
                <Route path="/student/mydisciplines" element={<Navigate to="/alldisciplines" replace />} />
                <Route path="/teacher" element={<Navigate to="/loginteacher" replace />} />
                <Route path="/teacher/mydisciplines" element={<Navigate to="/loginteacher" replace />} />
                 <Route path="/teacher/mydisciplines/:id" element={<Navigate to="/loginteacher" replace />} />
                <Route path="/admin/users" element={<Navigate to="/loginadmin" replace />} />
                <Route path="/admin/disciplines" element={<Navigate to="/loginadmin" replace />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </>
  );
};

const App = () => {
  const [loggedInStudent, setLoggedInStudent] = useState(false);
  const [loggedInTeacher, setLoggedInTeacher] = useState(false);
  const [loggedInAdmin, setLoggedInAdmin] = useState(false);
  const [userCredentials, setUserCredentials] = useState({ username: '', password: '' });

  const handleLogin = (username, password, userType) => {
    setUserCredentials({ username, password });
    if (userType === 'Student') {
      setLoggedInStudent(true);
      setLoggedInTeacher(false);
      setLoggedInAdmin(false);
    } else if (userType === 'Teacher') {
      setLoggedInTeacher(true);
      setLoggedInStudent(false);
      setLoggedInAdmin(false);
    } else if (userType === 'Admin') {
      setLoggedInAdmin(true);
      setLoggedInStudent(false);
      setLoggedInTeacher(false);
    }
  };

  const handleLogout = () => {
    setLoggedInStudent(false);
    setLoggedInTeacher(false);
    setLoggedInAdmin(false);
    setUserCredentials({ username: '', password: '' });
  };

  useEffect(() => {
    console.log(userCredentials);
  }, [userCredentials]);

  return (
    <Router>
      <AppContent 
        loggedInStudent={loggedInStudent} 
        loggedInTeacher={loggedInTeacher} 
        loggedInAdmin={loggedInAdmin} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        userCredentials={userCredentials} 
      />
    </Router>
  );
};

export default App;
