import React from 'react';
import './Contacts.css';

const Contacts = () => {
  return (
    <div className="contacts-container">
      <h1>Контакти</h1>
      <div className="contacts-details">
        <p>Корпус №3 ДНУ ім О.Гончара</p>
        <p>Факультет Прикладної математики</p>
        <p>просп. Дмитра Яворницького, 35</p>
        <p>Дніпро, 49000</p>
      </div>
      <div className="contacts-questions">
        <h2>Маєте питання?</h2>
        <p>Email: <a href="mailto:fpmdekanat@gmail.com">fpmdekanat@gmail.com</a></p>
        <p>Телефон деканату: <a href="tel:+380567664951">+38 (056) 766-49-51</a></p>
      </div>
    </div>
  );
}

export default Contacts;
