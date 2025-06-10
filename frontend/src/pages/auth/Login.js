import { Link, useNavigate } from 'react-router-dom';

import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      id: 'Manufacturer',
      title: 'Manufacturer',
      description: 'Create and manage your products',
      icon: '🏭',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea'
    },
    {
      id: 'Distributor',
      title: 'Distributor',
      description: 'Distribute products to sellers',
      icon: '🚚',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#f093fb'
    },
    {
      id: 'Seller',
      title: 'Seller',
      description: 'Sell products to customers',
      icon: '🏪',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#4facfe'
    },
    {
      id: 'Customer',
      title: 'Customer',
      description: 'Browse and purchase products',
      icon: '🛒',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      color: '#43e97b'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (roleId) => {
    setCredentials(prev => ({
      ...prev,
      role: roleId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.role) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    try {
      await login(credentials);
    } catch (error) {
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(role => role.id === credentials.role);

  return (
    <>
      <style jsx>{`
        .modern-login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .modern-login-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        }

        .role-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .role-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--role-gradient);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .role-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .role-card:hover::before {
          opacity: 0.1;
        }

        .role-card.selected {
          border: 2px solid var(--role-color);
          box-shadow: 0 0 30px var(--role-color-shadow);
          transform: scale(1.02);
        }

        .role-card.selected::before {
          opacity: 0.15;
        }

        .modern-input {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          transition: all 0.3s ease;
          padding: 16px 20px;
        }

        .modern-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .modern-input:focus {
          outline: none;
          border-color: ${selectedRole ? selectedRole.color : '#667eea'};
          box-shadow: 0 0 20px ${selectedRole ? selectedRole.color + '40' : '#667eea40'};
          background: rgba(255, 255, 255, 0.15);
        }

        .modern-btn {
          background: ${selectedRole ? selectedRole.gradient : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          padding: 16px 32px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .modern-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .modern-btn:hover::before {
          left: 100%;
        }

        .modern-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        }

        .modern-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .slide-in {
          animation: slideIn 0.8s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(102, 126, 234, 0); }
          100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
        }

        .text-glow {
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="modern-login-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8 col-xl-6">
              <div className="glass-card fade-in">
                <div className="p-5">
                  {/* Header */}
                  <div className="text-center mb-5 slide-in">
                  
                  
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* Role Selection Cards */}
                    <div className="mb-4">
                      
                      <div className="row g-2">
                        {roles.map((role, index) => (
                          <div key={role.id} className="col-6">
                            <div 
                              className={`role-card ${
                                credentials.role === role.id ? 'selected' : ''
                              }`}
                              style={{
                                '--role-gradient': role.gradient,
                                '--role-color': role.color,
                                '--role-color-shadow': role.color + '40',
                                animationDelay: `${index * 0.1}s`
                              }}
                              onClick={() => handleRoleSelect(role.id)}
                            >
                              <div className="p-3 text-center position-relative">
                                <div className="fs-4 mb-2" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                                  {role.icon}
                                </div>
                                <h6 className="text-white fw-bold mb-1 small">{role.title}</h6>
                                <p className="text-white-50 mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                                  {role.description}
                                </p>
                                {credentials.role === role.id && (
                                  <div className="position-absolute top-0 end-0 m-1">
                                    <div className="bg-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}>
                                      <svg width="12" height="12" fill="white" viewBox="0 0 16 16">
                                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Username Field */}
                    <div className="mb-4">
                      <label htmlFor="username" className="form-label text-white fw-semibold mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control modern-input"
                        id="username"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        required
                      />
                    </div>

                    {/* Password Field */}
                    <div className="mb-5">
                      <label htmlFor="password" className="form-label text-white fw-semibold mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control modern-input"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className={`btn modern-btn w-100 mb-4 ${!loading ? 'pulse' : ''}`}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="d-flex align-items-center justify-content-center">
                          <div className="loading-spinner me-2"></div>
                          Signing In...
                        </div>
                      ) : (
                        <>
                          <span className="me-2">🚀</span>
                          Sign In
                        </>
                      )}
                    </button>
                  </form>

                  {/* Register Link */}
                  <div className="text-center">
                    <p className="mb-0 text-white-50">
                      Don't have an account?{' '}
                      <Link 
                        to="/auth/register" 
                        className="text-white fw-semibold text-decoration-none"
                        style={{ 
                          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.8)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
                        }}
                      >
                        Create Account
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;