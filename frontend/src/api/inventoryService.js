import apiClient from './apiClient';

export const getManufacturerInventory = async () => {
  const response = await apiClient.get('/inventory/manufacturer');
  return response.data;
};

export const getDistributorInventory = async () => {
  const response = await apiClient.get('/inventory/distributor');
  return response.data;
};

export const getSellerInventory = async () => {
  const response = await apiClient.get('/inventory/seller');
  return response.data;
};

export const updateManufacturerInventory = async (blanketModelId, quantity) => {
  await apiClient.put(`/inventory/manufacturer/${blanketModelId}`, {quantity});
};

export const updateDistributorInventory = async (blanketModelId, quantity) => {
  await apiClient.put(`/inventory/distributor/${blanketModelId}`, quantity);
};

export const updateSellerInventory = async (blanketModelId, quantity) => {
  await apiClient.put(`/inventory/seller/${blanketModelId}`, quantity);
};