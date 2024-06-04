import axios from 'axios';

const API_KEY = 'patJCqmyhev9WOlAq.da66f9ddb72dfca2197107cf7df5a9d95a94a6242a62571db634fe0b475c138e';
const BASE_ID = 'appwbTOhoNrrmY2iM';

const axiosInstance = axios.create({
  baseURL: `https://api.airtable.com/v0/${BASE_ID}`,
  headers: {
    Authorization: `Bearer ${API_KEY}`
  },
  timeout: 10000 // Увеличиваем время ожидания до 10 секунд
});

export const fetchDataFromAirtable = async (tableName) => {
  try {
    const response = await axiosInstance.get(`/${tableName}`);
    return response.data.records;
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    throw error;
  }
};

export const updateRecord = async (tableName, recordId, data) => {
  try {
    const filteredData = { ...data };
    // Удаляем поле UserID, если это не таблица UserCourses
    if (tableName !== 'UserCourses') {
      delete filteredData.UserID;
    }
   if (tableName === 'Disciplines') {
      delete filteredData.DisciplineID;
      delete filteredData.UDTeacher
    }

    console.log('Updating record:', { tableName, recordId, data: filteredData }); // Log the data
    const response = await axiosInstance.patch(`/${tableName}/${recordId}`, {
      fields: filteredData
    });
    return response.data;
  } catch (error) {
    console.error('Error updating record in Airtable:', error);
    if (error.response && error.response.status === 422) {
      console.error('Invalid data:', data);
    }
    throw error;
  }
};

export const addRecord = async (tableName, data) => {
  try {
    const filteredData = { ...data };
    // Удаляем поле UserCourses, если это таблица UserCourses
    if (tableName === 'UserCourses') {
      delete filteredData.UserCourses;
    }
    if (tableName !== 'UserCourses') {
      delete filteredData.UserID;
    }
    if (tableName === 'Disciplines') {
      delete filteredData.DisciplineID;
      delete filteredData.UDTeacher
    }
    console.log('Adding record:', { tableName, data: filteredData }); // Log the data
    const response = await axiosInstance.post(`/${tableName}`, {
      fields: filteredData
    });
    return response.data;
  } catch (error) {
    console.error('Error adding record to Airtable:', error);
    if (error.response && error.response.status === 422) {
      console.error('Invalid data:', data);
    }
    throw error;
  }
};

export const deleteRecord = async (tableName, recordId) => {
  try {
    console.log('Deleting record:', { tableName, recordId }); // Log the data
    const response = await axiosInstance.delete(`/${tableName}/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting record from Airtable:', error);
    throw error;
  }
};

// database.js
export const fetchAllDisciplines = async () => {
  try {
    const response = await axiosInstance.get(`/Disciplines`);
    return response.data.records;
  } catch (error) {
    console.error('Error fetching disciplines from Airtable:', error);
    throw error;
  }
};

export default fetchDataFromAirtable;
