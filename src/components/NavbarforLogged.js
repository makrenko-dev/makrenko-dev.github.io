import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './NavbarforLogged.css';

const NavbarforLogged = ({ onLogout, loggedInStudent, loggedInTeacher, loggedInAdmin }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light navbl">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav navv">
            {loggedInStudent === true && (
              <>
                <li className="nav-item itm">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link adlink activead' : 'nav-link adlink')} exact to="/student/available">ДОСТУПНІ ДИСЦИПЛІНИ</NavLink>
                </li>
                <li className="nav-item itm">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link adlink activead' : 'nav-link adlink')} to="/student/likes">УПОДОБАЙКИ</NavLink>
                </li>
                <li className="nav-item itm">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link adlink activead' : 'nav-link adlink')} to="/student/mydisciplines">МОЇ ДИСЦИПЛІНИ</NavLink>
                </li>
              </>
            )}
            {loggedInTeacher === true && (
              <>
                <li className="nav-item itm">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link adlink activead' : 'nav-link adlink')} exact to="/teacher/mydisciplines">МОЇ ДИСЦИПЛІНИ</NavLink>
                </li>
              </>
            )}
            {loggedInAdmin === true && (
              <>
                <li className="nav-item itm">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link adlink activead' : 'nav-link adlink')} exact to="/admin/users">КОРИСТУВАЧІ</NavLink>
                </li>
                <li className="nav-item itm">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link adlink activead' : 'nav-link adlink')} to="/admin/disciplines">ДИСЦИПЛІНИ</NavLink>
                </li>
              </>
            )}
            <li className="nav-item itm">
              <button className="nav-link adlink logout-button" onClick={onLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> ВИХІД
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarforLogged;
