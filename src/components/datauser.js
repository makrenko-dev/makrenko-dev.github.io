import axios from 'axios';
import React from 'react';

const API_KEY = 'patJCqmyhev9WOlAq.da66f9ddb72dfca2197107cf7df5a9d95a94a6242a62571db634fe0b475c138e';
const BASE_ID = 'appwbTOhoNrrmY2iM';

const fetchTeacherFromAirtable = async (datatable, teacherID) => {
  try {
    const response = await axios.get(`https://api.airtable.com/v0/${BASE_ID}/${datatable}/${teacherID}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });
    const teacherData = response.data;
    return teacherData; // Возвращаем данные учителя
  } catch (error) {
    console.error('Error fetching teacher data from Airtable:', error);
    throw error;
  }
};


export default fetchTeacherFromAirtable;
