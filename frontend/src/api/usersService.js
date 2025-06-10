// usersService.js

import apiClient from './apiClient';

export const getDistributors = async () => {
  const response = await apiClient.get('/users/distributors');
  return response.data;
};

export const getSellers = async () => {
  const response = await apiClient.get('/users/sellers');
  return response.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};