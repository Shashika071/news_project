import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getBlanketModels = async () => {
  const response = await axios.get(`${API_URL}/blanketmodels`, getAuthHeader());
  return response.data;
};

export const createBlanketModel = async (modelData) => {
  const response = await axios.post(`${API_URL}/blanketmodels`, modelData, getAuthHeader());
  return response.data;
};

export const updateBlanketModel = async (id, modelData) => {
  await axios.put(`${API_URL}/blanketmodels/${id}`, modelData, getAuthHeader());
};

export const deleteBlanketModel = async (id) => {
  await axios.delete(`${API_URL}/blanketmodels/${id}`, getAuthHeader());
};