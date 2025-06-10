import React, { useEffect, useState } from 'react';

import CartDrawer from '../../components/customer/CartDrawer';
import OrderHistory from '../../components/customer/OrderHistory';
import { createOrder } from '../../api/orderService';
import { getBlanketModels } from '../../api/blanketService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Shop = () => {
  const [blanketModels, setBlanketModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('shop');
  const { user } = useAuth();

  useEffect(() => {
    fetchBlanketModels();
  }, []);

  const fetchBlanketModels = async () => {
    try {
      setLoading(true);
      const models = await getBlanketModels();
      setBlanketModels(models.filter(model => model.isActive));
    } catch (error) {
      toast.error('Failed to fetch blanket models');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = blanketModels
    .filter(model => {
      const matchesSearch = 
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
        model.material.toLowerCase().includes(filterBy.toLowerCase());
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.retailPrice - b.retailPrice;
        case 'price-high':
          return b.retailPrice - a.retailPrice;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleAddToCart = (model) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === model.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === model.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...model, quantity: 1 }];
    });
    
    toast.success(`${model.name} added to cart`);
  };

  const handleRemoveFromCart = (modelId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== modelId));
  };

  const handleUpdateQuantity = (modelId, quantity) => {
    if (quantity < 1) {
      handleRemoveFromCart(modelId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === modelId ? { ...item, quantity } : item
      )
    );
  };

  const handleCheckout = async () => {
  try {
    // Generate a simple order number (you can make this more sophisticated)
    const orderNumber = `ORD-${Date.now()}`;
    
    const orderData = {
      orderNumber: orderNumber,
      status: "Pending", // Default status
      sellerId: 15, // Default seller or implement seller selection
      shippingAddress: user.address || '123 Main Street', // Default address if user.address is empty
      contactPhone: user.phone || '0771234567', // Default phone if user.phone is empty
      notes: "Please deliver carefully.", // Default note
      orderItems: cartItems.map(item => ({
        blanketModelId: item.id,
        quantity: item.quantity,
        unitPrice: item.retailPrice
      }))
    };
    
    await createOrder(orderData);
    toast.success('Order placed successfully!');
    setCartItems([]);
    setIsCartOpen(false);
  } catch (error) {
    toast.error('Failed to place order');
    console.error(error);
  }
};
  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading our cozy collection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'shop' ? 'active' : ''}`}
                onClick={() => setActiveTab('shop')}
              >
                Shop
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                My Orders
              </button>
            </li>
          </ul>
        </div>
      </div>

      {activeTab === 'shop' ? (
        <>
          {/* Header Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="text-center mb-4">
                <h1 className="display-4 fw-bold text-primary mb-2">
                  <i className="fas fa-blanket me-3"></i>
                  Cozy Comfort Blankets
                </h1>
                <p className="lead text-muted">Discover our premium collection of luxury blankets</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="row g-3">
                    {/* Search Input */}
                    <div className="col-md-6">
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="fas fa-search text-muted"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          placeholder="Search blankets by name, material, or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="name">
                          <i className="fas fa-sort-alpha-down me-2"></i>Sort by Name
                        </option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                      >
                        <option value="all">All Materials</option>
                        <option value="cotton">Cotton</option>
                        <option value="wool">Wool</option>
                        <option value="fleece">Fleece</option>
                        <option value="cashmere">Cashmere</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="row mb-3">
            <div className="col-12">
              <p className="text-muted mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Showing {filteredModels.length} of {blanketModels.length} blankets
              </p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="row g-4">
            {filteredModels.length === 0 ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4 className="text-muted">No blankets found</h4>
                    <p className="text-muted">Try adjusting your search or filter criteria</p>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterBy('all');
                      }}
                    >
                      <i className="fas fa-refresh me-2"></i>Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              filteredModels.map((model) => (
                <div className="col-lg-4 col-md-6 col-sm-12" key={model.id}>
                  <div className="card h-100 shadow-sm border-0 product-card">
                    {/* Product Image */}
                    <div className="position-relative overflow-hidden">
                      <img
                        src={model.imageUrl || '/placeholder-blanket.jpg'}
                        className="card-img-top product-image"
                        alt={model.name}
                        style={{ height: '250px', objectFit: 'cover' }}
                      />
                    
                    </div>

                    {/* Product Details */}
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title fw-bold mb-1">{model.name}</h5>
                      
                      <div className="mb-2">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="badge bg-gradient-primary text-white px-3 py-2 rounded-pill">
                            <i className="fas fa-fabric me-1"></i>
                            {model.material}
                          </span>
                          <span className="badge bg-gradient-secondary text-white px-3 py-2 rounded-pill">
                            <i className="fas fa-expand-arrows-alt me-1"></i>
                            {model.size}
                          </span>
                          <span className="badge bg-gradient-info text-white px-2 py-1 rounded-pill">
                            <i className="fas fa-certificate me-1"></i>
                            Premium
                          </span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <span className="h4 text-primary fw-bold">
                          LKR {model.retailPrice.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <p className="card-text text-muted small mb-3 flex-grow-1">
                        {model.description}
                      </p>

                      {/* Product Features */}
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          <i className="fas fa-shield-alt me-1 text-success"></i>
                          Quality Guaranteed
                        </small>
                        <small className="text-muted d-block">
                          <i className="fas fa-truck me-1 text-info"></i>
                          Free Delivery
                        </small>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto">
                        <div className="d-grid">
                          <button
                            className="btn btn-gradient-primary btn-lg position-relative overflow-hidden"
                            onClick={() => handleAddToCart(model)}
                          >
                            <span className="position-relative z-index-1">
                              <i className="fas fa-shopping-cart me-2"></i>
                              Add to Cart
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Button */}
          <div className="position-fixed bottom-0 end-0 m-4">
            <button 
              className="btn btn-primary btn-lg rounded-pill shadow-lg"
              onClick={() => setIsCartOpen(true)}
            >
              <i className="fas fa-shopping-cart me-2"></i>
              {cartItems.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Cart Drawer */}
          <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onRemove={handleRemoveFromCart}
            onUpdateQuantity={handleUpdateQuantity}
            onCheckout={handleCheckout}
          />
        </>
      ) : (
        <OrderHistory />
      )}

      {/* Additional Styles */}
      <style jsx>{`
        .product-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 16px !important;
          overflow: hidden;
        }
        
        .product-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
        }
        
        .product-image {
          transition: transform 0.4s ease;
          border-radius: 16px 16px 0 0;
        }
        
        .product-card:hover .product-image {
          transform: scale(1.08);
        }
        
        .wishlist-btn {
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9) !important;
        }
        
        .wishlist-btn:hover {
          transform: scale(1.1);
          background: rgba(220, 53, 69, 0.9) !important;
          color: white !important;
        }
        
        .btn-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .btn-gradient-primary:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-gradient-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .btn-gradient-primary:hover::before {
          left: 100%;
        }
        
        .bg-gradient-danger {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24) !important;
        }
        
        .bg-gradient-success {
          background: linear-gradient(135deg, #51cf66, #40c057) !important;
        }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea, #764ba2) !important;
        }
        
        .bg-gradient-secondary {
          background: linear-gradient(135deg, #a8edea, #fed6e3) !important;
          color: #333 !important;
        }
        
        .bg-gradient-info {
          background: linear-gradient(135deg, #74b9ff, #0984e3) !important;
        }
        
        .input-group-text {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border: 1px solid #dee2e6;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        
        .card {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }
        
        .progress {
          background-color: rgba(0,0,0,0.1);
        }
        
        .btn-outline-success:hover,
        .btn-outline-primary:hover,
        .btn-outline-info:hover {
          transform: translateY(-1px);
        }
        
        .badge {
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        
        .text-primary {
          color: #667eea !important;
        }
        
        .btn-light {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .product-card:hover .badge {
          animation: pulse 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Shop;