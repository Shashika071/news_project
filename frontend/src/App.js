import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import AuthLayout from './components/layout/AuthLayout';
import CssBaseline from '@mui/material/CssBaseline';
import CustomerShop from './pages/customer/Shop';
import DistributorDashboard from './pages/distributor/Dashboard';
// Auth pages
import Login from './pages/auth/Login';
// Layout components
import MainLayout from './components/layout/MainLayout';
// Role-based pages
import ManufacturerDashboard from './pages/manufacturer/Dashboard';
import Register from './pages/auth/Register';
import SellerDashboard from './pages/seller/Dashboard';
import { Toaster } from 'react-hot-toast';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* Protected routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomeRedirect />} />
              <Route path="manufacturer/*" element={<ManufacturerRoutes />} />
              <Route path="distributor/*" element={<DistributorRoutes />} />
              <Route path="seller/*" element={<SellerRoutes />} />
              <Route path="shop" element={<CustomerShop />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

const HomeRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/auth/login" />;
  
  switch(user.role) {
    case 'Manufacturer':
      return <Navigate to="/manufacturer/dashboard" />;
    case 'Distributor':
      return <Navigate to="/distributor/dashboard" />;
    case 'Seller':
      return <Navigate to="/seller/dashboard" />;
    default:
      return <Navigate to="/shop" />;
  }
};

const ManufacturerRoutes = () => {
  const { user } = useAuth();
  
  if (user?.role !== 'Manufacturer') {
    return <Navigate to="/auth/login" />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<ManufacturerDashboard />} />
      {/* Add more manufacturer routes as needed */}
    </Routes>
  );
};

const DistributorRoutes = () => {
  const { user } = useAuth();
  
  if (user?.role !== 'Distributor') {
    return <Navigate to="/auth/login" />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<DistributorDashboard />} />
      {/* Add more distributor routes as needed */}
    </Routes>
  );
};

const SellerRoutes = () => {
  const { user } = useAuth();
  
  if (user?.role !== 'Seller') {
    return <Navigate to="/auth/login" />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<SellerDashboard />} />
      {/* Add more seller routes as needed */}
    </Routes>
  );
};

export default App;