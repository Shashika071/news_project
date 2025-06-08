import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';

import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cozy Comfort
          </Typography>
          {user && (
            <>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                {user.businessName || user.username}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 3, flexGrow: 1 }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Cozy Comfort. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;