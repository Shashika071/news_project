import jwtDecode from 'jwt-decode';

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const clearToken = () => {
  localStorage.removeItem('token');
};

export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};