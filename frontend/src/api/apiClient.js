import axios from 'axios';
import { getToken } from '../utils/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Update with your backend URL
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;