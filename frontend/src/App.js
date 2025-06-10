// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Layouts
import AuthLayout from './components/layout/AuthLayout';
import CreateDistributorOrder from './pages/seller/CreateDistributorOrder';
import { CssBaseline } from '@mui/material';
import CustomerShop from './pages/customer/Shop';
import DistributorDashboard from './pages/distributor/Dashboard';
import InventoryForm from './components/seller/InventoryForm';
// Pages
import Login from './pages/auth/Login';
import MainLayout from './components/layout/MainLayout';
import ManufacturerDashboard from './pages/manufacturer/Dashboard';
import ManufacturerOrderDetails from './components/manufacturer/ManufacturerOrderDetails';
import OrderDetail from './components/seller/OrderDetail';
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
      <Router>
        <AuthProvider>
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
              <Route path="/manufacturer-orders/:id" element={<ManufacturerOrderDetails />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

// Redirect based on role
const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth/login" replace />;

  switch (user.role) {
    case 'Manufacturer':
      return <Navigate to="/manufacturer/dashboard" replace />;
    case 'Distributor':
      return <Navigate to="/distributor/dashboard" replace />;
    case 'Seller':
      return <Navigate to="/seller/dashboard" replace />;
    default:
      return <Navigate to="/shop" replace />;
  }
};

// Manufacturer routes
const ManufacturerRoutes = () => {
  const { user } = useAuth();

  if (user?.role !== 'Manufacturer') {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<ManufacturerDashboard />} />
      
    </Routes>
  );
};

// Distributor routes
const DistributorRoutes = () => {
  const { user } = useAuth();

  if (user?.role !== 'Distributor') {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<DistributorDashboard />} />
      {/* Add more distributor routes here */}
    </Routes>
  );
};

// Seller routes
const SellerRoutes = () => {
  const { user } = useAuth();

  if (user?.role !== 'Seller') {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<SellerDashboard />} />
       <Route path="/seller/orders/:id" element={<OrderDetail />} />
       <Route path="/seller/inventory/:id/edit" element={<InventoryForm />} />
       <Route path="/seller/orders/create" element={<CreateDistributorOrder />} />
    </Routes>
  );
};

export default App;
