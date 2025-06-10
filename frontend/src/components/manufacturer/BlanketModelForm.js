import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useEffect, useState } from 'react';

const BlanketModelForm = ({
  open,
  onClose,
  onSubmit,
  initialValues = {
    name: '',
    description: '',
    material: '',
    size: '',
    weight: 0,
    manufacturerPrice: 0,
    retailPrice: 0,
    imageUrl: '',
    isActive: true
  }
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialValues);
    setErrors({});
  }, [initialValues, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : (name === 'weight' || name.includes('Price')) 
          ? parseFloat(value) || 0 
          : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.material.trim()) newErrors.material = 'Material is required';
    if (!formData.size.trim()) newErrors.size = 'Size is required';
    if (formData.manufacturerPrice <= 0) newErrors.manufacturerPrice = 'Price must be greater than 0';
    if (formData.retailPrice <= 0) newErrors.retailPrice = 'Price must be greater than 0';
    if (formData.weight <= 0) newErrors.weight = 'Weight must be greater than 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!open) return null;

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modern-modal {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
          backdrop-filter: blur(20px);
          border-radius: 25px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        @keyframes slideUp {
          from { 
            transform: translateY(50px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .modal-header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 25px 25px 0 0;
          padding: 2rem;
          text-align: center;
          position: relative;
        }
        
        .modal-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }
        
        .form-container {
          padding: 2rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
          display: block;
          font-size: 0.95rem;
        }
        
        .form-input {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #e1e8ed;
          border-radius: 15px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
        }
        
        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          background: white;
          transform: translateY(-1px);
        }
        
        .form-input.error {
          border-color: #ff6b6b;
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }
        
        .error-message {
          color: #ff6b6b;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          font-weight: 500;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 20px;
          background: linear-gradient(135deg, #a8edea, #fed6e3);
          border-radius: 15px;
          margin-bottom: 1.5rem;
        }
        
        .checkbox {
          width: 20px;
          height: 20px;
          accent-color: #667eea;
        }
        
        .checkbox-label {
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }
        
        .modal-actions {
          padding: 0 2rem 2rem;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        
        .btn-cancel {
          padding: 12px 30px;
          border: 2px solid #e1e8ed;
          background: white;
          color: #666;
          border-radius: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-cancel:hover {
          background: #f8f9fa;
          border-color: #ddd;
          transform: translateY(-1px);
        }
        
        .btn-submit {
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          color: white;
          border-radius: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #764ba2, #667eea);
        }
        
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .preview-section {
          background: linear-gradient(135deg, #ffecd2, #fcb69f);
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .preview-title {
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .image-preview {
          width: 100%;
          max-width: 200px;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .modern-modal {
            width: 95%;
            margin: 1rem;
          }
          
          .modal-actions {
            flex-direction: column;
          }
          
          .btn-cancel, .btn-submit {
            width: 100%;
          }
        }
      `}</style>
      
      <div className="modal-overlay" onClick={onClose}>
        <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
            <h2 className="modal-title">
              {initialValues.id ? '✏️ Edit Blanket Model' : '✨ Create New Blanket Model'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-container">
             
              {formData.imageUrl && (
                <div className="preview-section">
                  <div className="preview-title">
                    🖼️ Image Preview
                  </div>
                  <img 
                    src={formData.imageUrl} 
                    alt="Blanket preview" 
                    className="image-preview"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              
              {/* Basic Information */}
              <div className="form-group">
                <label className="form-label">🏷️ Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter blanket model name..."
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">📝 Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input textarea"
                  placeholder="Describe your cozy creation..."
                  rows="3"
                />
              </div>

              {/* Material & Size */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">🧵 Material *</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className={`form-input ${errors.material ? 'error' : ''}`}
                    placeholder="Cotton, Wool, etc."
                  />
                  {errors.material && <div className="error-message">{errors.material}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">📏 Size *</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className={`form-input ${errors.size ? 'error' : ''}`}
                    placeholder="S, M, L, XL"
                  />
                  {errors.size && <div className="error-message">{errors.size}</div>}
                </div>
              </div>

              {/* Weight & Prices */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">⚖️ Weight (kg) *</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className={`form-input ${errors.weight ? 'error' : ''}`}
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                  />
                  {errors.weight && <div className="error-message">{errors.weight}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">💰 Manufacturer Price *</label>
                  <input
                    type="number"
                    name="manufacturerPrice"
                    value={formData.manufacturerPrice}
                    onChange={handleChange}
                    className={`form-input ${errors.manufacturerPrice ? 'error' : ''}`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {errors.manufacturerPrice && <div className="error-message">{errors.manufacturerPrice}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">🏪 Retail Price *</label>
                  <input
                    type="number"
                    name="retailPrice"
                    value={formData.retailPrice}
                    onChange={handleChange}
                    className={`form-input ${errors.retailPrice ? 'error' : ''}`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {errors.retailPrice && <div className="error-message">{errors.retailPrice}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">🖼️ Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="checkbox"
                  id="isActive"
                />
                <label htmlFor="isActive" className="checkbox-label">
                  🟢 Active Product (Available for sale)
                </label>
              </div>

              {/* Profit Calculation */}
              {formData.retailPrice > 0 && formData.manufacturerPrice > 0 && (
                <div className="preview-section">
                  <div className="preview-title">
                    💹 Profit Analysis
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <strong>Profit Margin:</strong><br />
                      <span style={{ color: '#27ae60', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        ${(formData.retailPrice - formData.manufacturerPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="col-6">
                      <strong>Profit %:</strong><br />
                      <span style={{ color: '#e74c3c', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {((formData.retailPrice - formData.manufacturerPrice) / formData.manufacturerPrice * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                {initialValues.id ? '💾 Update Model' : '🚀 Create Model'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default BlanketModelForm;