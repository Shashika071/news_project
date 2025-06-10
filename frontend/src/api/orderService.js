import apiClient from './apiClient';

// Customer/Seller Orders
export const getOrders = async () => {
  const response = await apiClient.get('/orders');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await apiClient.put(`/orders/${id}/status`, status, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};
// Distributor Orders
export const getDistributorOrders = async () => {
  const response = await apiClient.get('/distributororders');
  return response.data;
};

export const getDistributorOrderById = async (id) => {
  const response = await apiClient.get(`/distributororders/${id}`);
  return response.data;
};

export const createDistributorOrder = async (orderData) => {
  const response = await apiClient.post('/distributororders', orderData);
  return response.data;
};

export const updateDistributorOrderStatus = async (id, status) => {
  try {
    const response = await apiClient.put(`/distributororders/${id}/status`, { 
      status 
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data || 'Failed to update status';
      throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
    throw error;
  }
};

// Production
export const getProductionCapacities = async () => {
  const response = await apiClient.get('/production');
  return response.data;
};

export const updateProductionCapacity = async (blanketModelId, capacityData) => {
  const response = await apiClient.put(`/production/${blanketModelId}`, capacityData);
  return response.data;
};