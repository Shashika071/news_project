import { login as apiLogin, register as apiRegister, getCurrentUser } from '../api/authService';
import { createContext, useContext, useEffect, useState } from 'react';

import { decodeToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to authenticate', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const token = await apiLogin(credentials);
      localStorage.setItem('token', token);
      const userData = await getCurrentUser();
      setUser(userData);
      navigate(getHomeRoute(userData.role));
      return true;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await apiRegister(userData);
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/auth/login');
  };

  const getHomeRoute = (role) => {
    switch(role) {
      case 'Manufacturer':
        return '/manufacturer/dashboard';
      case 'Distributor':
        return '/distributor/dashboard';
      case 'Seller':
        return '/seller/dashboard';
      default:
        return '/shop';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);