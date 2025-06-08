import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const roles = [
  { value: 2, label: 'Distributor' },
  { value: 3, label: 'Seller' },
  { value: 4, label: 'Customer' }
];

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    roleId: 4,
    businessName: '',
    contactPerson: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(userData);
      toast.success('Registration successful! Please login.');
      navigate('/auth/login');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Register
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={userData.password}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="roleId"
                  value={userData.roleId}
                  onChange={handleChange}
                  label="Role"
                  required
                >
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {userData.roleId !== 4 && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    name="businessName"
                    value={userData.businessName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    name="contactPerson"
                    value={userData.contactPerson}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={userData.address}
                    onChange={handleChange}
                    required
                    multiline
                    rows={2}
                  />
                </Grid>
              </>
            )}
          </Grid>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link to="/auth/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Already have an account? Login
              </Typography>
            </Link>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Register;