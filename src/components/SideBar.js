import React, { useState, useEffect } from 'react';
import './SideBar.css';
import { CiBoxList } from "react-icons/ci";
import { PiStudentFill, PiChalkboardTeacherFill } from "react-icons/pi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ loggedInStudent, loggedInTeacher, loggedInAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState(null);

  // Update the selected item based on the current route
  useEffect(() => {
    switch (location.pathname) {
      case '/alldisciplines':
        setSelectedItem(0);
        break;
      case '/student/available':
      case '/loginstudent':
        setSelectedItem(1);
        break;
      case '/teacher/mydisciplines':
      case '/loginteacher':
        setSelectedItem(2);
        break;
      case '/admin/users':
      case '/loginadmin':
        setSelectedItem(3);
        break;
      default:
        setSelectedItem(null);
    }
  }, [location.pathname]);

  const handleItemClick = (route, index) => {
    setSelectedItem(index);
    navigate(route);
  };

  return (
    <div className='sb'>
      <div style={{ width: '40px', height: '40px', backgroundColor: '#507AE8', alignSelf: 'flex-end' }}> </div>
      <ul className='ulside'>
        <li className={selectedItem === 0 ? 'liside selected' : 'liside'} onClick={() => handleItemClick('/alldisciplines', 0)}><CiBoxList style={{ marginRight: '10px' }} /> Всі дисципліни</li>
        <li className={selectedItem === 1 ? 'liside selected' : 'liside'} onClick={() => handleItemClick(loggedInStudent ? '/student/available' : '/loginstudent', 1)}><PiStudentFill style={{ marginRight: '10px' }} /> Для студента</li>
        <li className={selectedItem === 2 ? 'liside selected' : 'liside'} onClick={() => handleItemClick(loggedInTeacher ? '/teacher/mydisciplines' : '/loginteacher', 2)}><PiChalkboardTeacherFill style={{ marginRight: '10px' }} /> Для викладача</li>
        <li className={selectedItem === 3 ? 'liside selected' : 'liside'} onClick={() => handleItemClick(loggedInAdmin ? '/admin/users' : '/loginadmin', 3)}><MdOutlineAdminPanelSettings style={{ marginRight: '10px' }} /> Для адміністратора</li>
      </ul>
    </div>
  );
};

export default Sidebar;
