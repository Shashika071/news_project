import { BoxArrowRight, HouseDoorFill, PersonCircle } from 'react-bootstrap-icons';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';

import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Modern Header */}
      <Navbar 
        className="shadow-lg border-0" 
        expand="lg" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Container>
          <Navbar.Brand 
            href="/" 
            className="d-flex align-items-center text-dark fw-bold fs-4"
            style={{ letterSpacing: '-0.5px' }}
          >
            <div 
              className="me-3 d-flex align-items-center justify-content-center rounded-3"
              style={{ 
                width: '45px', 
                height: '45px', 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
            >
              <HouseDoorFill className="text-white" size={20} />
            </div>
            <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Cozy Comfort
            </span>
          </Navbar.Brand>
          
          <Navbar.Toggle 
            aria-controls="basic-navbar-nav"
            className="border-0 shadow-none"
            style={{ outline: 'none' }}
          />
          
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center">
              {user && (
                <div className="d-flex align-items-center">
                  <div className="d-none d-md-flex align-items-center me-4 px-3 py-2 rounded-pill" 
                       style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                    <PersonCircle className="me-2 text-primary" size={18} />
                    <span className="text-dark fw-medium small">
                      {user.businessName || user.username}
                    </span>
                  </div>
                  <Button
                    onClick={logout}
                    className="d-flex align-items-center px-4 py-2 border-0 rounded-pill fw-medium transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                      transform: 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
                    }}
                  >
                    <BoxArrowRight className="me-2" size={16} />
                    <span className="d-none d-sm-inline">Logout</span>
                  </Button>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content Area */}
      <main className="flex-grow-1 position-relative">
        <div 
          className="position-absolute w-100 h-100 opacity-10"
          style={{
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <Container className="py-5 position-relative">
          <div 
            className="bg-white rounded-4 shadow-lg p-4 p-md-5"
            style={{ 
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              minHeight: '60vh'
            }}
          >
            <Outlet />
          </div>
        </Container>
      </main>

      {/* Modern Footer */}
      <footer 
        className="py-4 mt-auto"
        style={{ 
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Container>
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <div 
                  className="me-3 d-flex align-items-center justify-content-center rounded-2"
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: 'linear-gradient(135deg, #667eea, #764ba2)'
                  }}
                >
                  <HouseDoorFill className="text-white" size={14} />
                </div>
                <div>
                  <h6 className="text-white mb-0 fw-bold">Cozy Comfort</h6>
                  <small className="text-white-50">Your home comfort solution</small>
                </div>
              </div>
            </div>
            <div className="col-md-6 mt-3 mt-md-0">
              <div className="d-flex justify-content-md-end align-items-center">
                <div className="px-3 py-2 rounded-pill" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                  <small className="text-white-50">
                    © {new Date().getFullYear()} All rights reserved
                  </small>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default MainLayout;