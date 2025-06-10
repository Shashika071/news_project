import { Button, Container, Nav, Navbar } from 'react-bootstrap';

import { HouseDoorFill } from 'react-bootstrap-icons';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
        <Container>
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <HouseDoorFill className="me-2" size={24} />
            <span className="fw-bold">Cozy Comfort</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              {user && (
                <>
                  <Navbar.Text className="me-3 d-none d-lg-block">
                    Welcome, <span className="fw-semibold">{user.businessName || user.username}</span>
                  </Navbar.Text>
                  <Button 
                    variant="outline-light" 
                    onClick={logout}
                    className="ms-2"
                  >
                    Logout
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <main className="flex-grow-1 py-4 bg-light">
        <Container className="py-4">
          <Outlet />
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-auto">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center"> 
          </div>
          <hr className="my-3" />
          <p className="small text-center mb-0">
            © {new Date().getFullYear()} Cozy Comfort. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
};

export default MainLayout;