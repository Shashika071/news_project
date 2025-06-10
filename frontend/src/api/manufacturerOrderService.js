import apiClient from './apiClient';

export const getManufacturerOrders = async () => {
  const response = await apiClient.get('/manufacturerorders');
  return response.data;
};

export const getManufacturerOrder = async (id) => {
  const response = await apiClient.get(`/manufacturerorders/${id}`);
  return response.data;
};

export const createManufacturerOrder = async (orderData) => {
  const response = await apiClient.post('/manufacturerorders', orderData);
  return response.data;
};

export const approveManufacturerOrder = async (id) => {
  const response = await apiClient.put(`/manufacturerorders/${id}/approve`);
  return response.data;
};

export const completeManufacturerOrder = async (id) => {
  const response = await apiClient.put(`/manufacturerorders/${id}/complete`);
  return response.data;
};