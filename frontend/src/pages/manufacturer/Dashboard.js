import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useEffect, useState } from 'react';
import { createBlanketModel, deleteBlanketModel, getBlanketModels, updateBlanketModel } from '../../api/blanketService';

import BlanketModelForm from '../../components/manufacturer/BlanketModelForm';
import ManufacturerInventory from '../../components/manufacturer/ManufacturerInventory';
import ManufacturerOrdersList from '../../components/manufacturer/ManufacturerOrdersList';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [blanketModels, setBlanketModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState('models');

  useEffect(() => {
    fetchBlanketModels();
  }, []);

  const fetchBlanketModels = async () => {
    try {
      setLoading(true);
      const models = await getBlanketModels();
      setBlanketModels(models);
    } catch (error) {
      toast.error('Failed to fetch blanket models');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = () => {
    setSelectedModel(null);
    setOpenForm(true);
  };

  const handleEditModel = (model) => {
    setSelectedModel(model);
    setOpenForm(true);
  };

  const handleSubmitModel = async (modelData) => {
    try {
      if (selectedModel) {
        await updateBlanketModel(selectedModel.id, modelData);
        toast.success('Blanket model updated successfully');
      } else {
        await createBlanketModel(modelData);
        toast.success('Blanket model created successfully');
      }
      fetchBlanketModels();
      setOpenForm(false);
    } catch (error) {
      toast.error('Failed to save blanket model');
      console.error(error);
    }
  };

  const handleDeleteModel = async (id) => {
    if (window.confirm('Are you sure you want to delete this blanket model?')) {
      try {
        await deleteBlanketModel(id);
        toast.success('Blanket model deleted successfully');
        fetchBlanketModels();
      } catch (error) {
        toast.error('Failed to delete blanket model');
        console.error(error);
      }
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = blanketModels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(blanketModels.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <style jsx>{`
        .modern-dashboard {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .gradient-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .header-gradient {
          background: linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .btn-modern {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 15px;
          padding: 12px 24px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .btn-modern:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #764ba2, #667eea);
        }
        
        .btn-edit {
          background: linear-gradient(135deg, #feca57, #ff9ff3);
          border: none;
          border-radius: 10px;
          padding: 8px 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(254, 202, 87, 0.3);
        }
        
        .btn-edit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(254, 202, 87, 0.4);
        }
        
        .btn-delete {
          background: linear-gradient(135deg, #ff6b6b, #ffa726);
          border: none;
          border-radius: 10px;
          padding: 8px 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }
        
        .btn-delete:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        }
        
        .modern-table {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .modern-table thead {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }
        
        .modern-table tbody tr {
          transition: all 0.3s ease;
          border: none;
        }
        
        .modern-table tbody tr:hover {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          transform: scale(1.02);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .status-badge {
          border-radius: 20px;
          padding: 6px 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.75rem;
        }
        
        .status-active {
          background: linear-gradient(135deg, #00d2ff, #3a7bd5);
          color: white;
          box-shadow: 0 3px 10px rgba(0, 210, 255, 0.3);
        }
        
        .status-inactive {
          background: linear-gradient(135deg, #ff6b6b, #ffa726);
          color: white;
          box-shadow: 0 3px 10px rgba(255, 107, 107, 0.3);
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 6px solid rgba(102, 126, 234, 0.2);
          border-top: 6px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .welcome-card {
          background: linear-gradient(135deg, #ff9a9e, #fecfef, #fecfef);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 15px 35px rgba(255, 154, 158, 0.3);
        }
        
        .stats-card {
          background: linear-gradient(135deg, #a8edea, #fed6e3);
          border-radius: 15px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 10px 25px rgba(168, 237, 234, 0.3);
          transition: all 0.3s ease;
        }
        
        .stats-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(168, 237, 234, 0.4);
        }
        
        .pagination-modern .page-link {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          color: white;
          border-radius: 10px;
          margin: 0 3px;
          transition: all 0.3s ease;
        }
        
        .pagination-modern .page-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .pagination-modern .page-item.active .page-link {
          background: linear-gradient(135deg, #ff6b6b, #feca57);
          box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
        }
        
        .empty-state {
          background: linear-gradient(135deg, #ffecd2, #fcb69f);
          border-radius: 20px;
          padding: 3rem;
          text-align: center;
        }
        
        .price-tag {
          background: linear-gradient(135deg, #84fab0, #8fd3f4);
          color: #2c3e50;
          border-radius: 15px;
          padding: 8px 12px;
          font-weight: 700;
          display: inline-block;
          box-shadow: 0 3px 10px rgba(132, 250, 176, 0.3);
        }

        .inventory-card {
          background: linear-gradient(135deg, #a8edea, #fed6e3);
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(168, 237, 234, 0.3);
          transition: all 0.3s ease;
        }

        .inventory-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(168, 237, 234, 0.4);
        }

        .inventory-table {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 15px;
          overflow: hidden;
        }

        .inventory-table thead {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        /* New styles for tabs */
        .dashboard-tabs {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 15px;
          padding: 0.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          transition: all 0.3s ease;
        }
        
        .nav-tabs .nav-link.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        .nav-tabs .nav-link:not(.active):hover {
          color: #667eea;
          transform: translateY(-2px);
        }
        
        .tab-content {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <div className="modern-dashboard">
        <div className="container-fluid py-5">
          {/* Welcome Header */}
          <div className="welcome-card">
            <h1 className="header-gradient display-4 fw-bold mb-3">
              🏭 Manufacturer Dashboard
            </h1>
            <p className="lead text-dark mb-0">
              Welcome back, <strong>{user?.businessName || user?.username}</strong>! 
              Ready to manage your blanket empire? ✨
            </p>
          </div>

          {/* Stats Cards */}
          <div className="row mb-5">
            <div className="col-md-3 mb-3">
              <div className="stats-card">
                <h3 className="display-6 fw-bold text-primary mb-0">{blanketModels.length}</h3>
                <p className="mb-0 fw-semibold">Total Models</p>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="stats-card">
                <h3 className="display-6 fw-bold text-success mb-0">
                  {blanketModels.filter(m => m.isActive).length}
                </h3>
                <p className="mb-0 fw-semibold">Active Models</p>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="stats-card">
                <h3 className="display-6 fw-bold text-warning mb-0">
                  LKR{blanketModels.reduce((sum, m) => sum + (m.retailPrice || 0), 0).toFixed(0)}
                </h3>
                <p className="mb-0 fw-semibold">Total Value</p>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="stats-card">
                <h3 className="display-6 fw-bold text-info mb-0">
                  {new Set(blanketModels.map(m => m.material)).size}
                </h3>
                <p className="mb-0 fw-semibold">Materials</p>
              </div>
            </div>
          </div>

          {/* Inventory Management */}
          <ManufacturerInventory />

          {/* Tab Navigation */}
          <div className="dashboard-tabs">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'models' ? 'active' : ''}`}
                  onClick={() => setActiveTab('models')}
                >
                  🧵 Blanket Models
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  📦 Manufacturer Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'models' ? (
              <div className="gradient-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h2 className="fw-bold mb-1">Your Blanket Collection</h2>
                    <p className="text-muted mb-0">Manage your cozy creations</p>
                  </div>
                  <button 
                    className="btn btn-modern text-white d-flex align-items-center"
                    onClick={handleAddModel}
                  >
                    <span className="me-2">✨</span>
                    Create New Model
                  </button>
                </div>
                
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="loading-spinner"></div>
                  </div>
                ) : blanketModels.length === 0 ? (
                  <div className="empty-state">
                    <div className="mb-4" style={{ fontSize: '4rem' }}>🏠</div>
                    <h3 className="fw-bold mb-3">No blanket models yet!</h3>
                    <p className="lead mb-4">Time to create your first cozy masterpiece and start building your collection.</p>
                    <button className="btn btn-modern text-white" onClick={handleAddModel}>
                      🎨 Create Your First Model
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="modern-table">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th className="fw-bold py-3">🏷️ Product</th>
                            <th className="fw-bold py-3">🧵 Material</th>
                            <th className="fw-bold py-3">📏 Size</th>
                            <th className="fw-bold py-3">💰 Cost</th>
                            <th className="fw-bold py-3">🏪 Retail</th>
                            <th className="fw-bold py-3">📊 Status</th>
                            <th className="fw-bold py-3">⚡ Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((model, index) => (
                            <tr key={model.id}>
                              <td className="py-3">
                                <div>
                                  <div className="fw-bold text-primary mb-1">{model.name}</div>
                                  {model.description && (
                                    <small className="text-muted">{model.description}</small>
                                  )}
                                </div>
                              </td>
                              <td className="py-3">
                                <span className="badge bg-light text-dark border fw-semibold">
                                  {model.material}
                                </span>
                              </td>
                              <td className="py-3 fw-semibold">{model.size}</td>
                              <td className="py-3">
                                <span className="price-tag">
                                  LKR{model.manufacturerPrice?.toFixed(2) || '0.00'}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className="price-tag">
                                  LKR{model.retailPrice?.toFixed(2) || '0.00'}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`status-badge ${model.isActive ? 'status-active' : 'status-inactive'}`}>
                                  {model.isActive ? '🟢 Active' : '🔴 Inactive'}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-edit text-white btn-sm fw-semibold"
                                    onClick={() => handleEditModel(model)}
                                    title="Edit Model"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    className="btn btn-delete text-white btn-sm fw-semibold"
                                    onClick={() => handleDeleteModel(model.id)}
                                    title="Delete Model"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Modern Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-4">
                        <nav>
                          <ul className="pagination pagination-modern mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button 
                                className="page-link fw-semibold"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                ← Previous
                              </button>
                            </li>
                            
                            {[...Array(totalPages)].map((_, index) => (
                              <li 
                                key={index + 1} 
                                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                              >
                                <button
                                  className="page-link fw-semibold"
                                  onClick={() => paginate(index + 1)}
                                >
                                  {index + 1}
                                </button>
                              </li>
                            ))}
                            
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button 
                                className="page-link fw-semibold"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                Next →
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <ManufacturerOrdersList />
            )}
          </div>
        </div>

        {/* Form Modal/Component */}
        {openForm && (
          <BlanketModelForm
            open={openForm}
            onClose={() => setOpenForm(false)}
            onSubmit={handleSubmitModel}
            initialValues={selectedModel || {
              name: '',
              description: '',
              material: '',
              size: '',
              weight: 0,
              manufacturerPrice: 0,
              retailPrice: 0,
              imageUrl: '',
              isActive: true
            }}
          />
        )}
      </div>
    </>
  );
};

export default Dashboard;