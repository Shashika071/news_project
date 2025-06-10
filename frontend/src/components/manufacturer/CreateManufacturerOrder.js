import React, { useEffect, useState } from 'react';

import { createManufacturerOrder } from '../../api/manufacturerOrderService';
import { getBlanketModels } from '../../api/blanketService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const CreateManufacturerOrder = ({ onClose, onOrderCreated }) => {
  const { user } = useAuth();
  const [blanketModels, setBlanketModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    blanketModelId: '',
    quantity: 1,
    unitPrice: 0
  });

  useEffect(() => {
    fetchBlanketModels();
  }, []);

  const fetchBlanketModels = async () => {
    try {
      setLoading(true);
      const models = await getBlanketModels();
      setBlanketModels(models.filter(m => m.isActive));
    } catch (error) {
      toast.error('Failed to fetch blanket models');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!currentItem.blanketModelId || currentItem.quantity <= 0) {
      toast.error('Please select a model and enter a valid quantity');
      return;
    }

    const selectedModel = blanketModels.find(m => m.id === parseInt(currentItem.blanketModelId));
    const unitPrice = selectedModel.manufacturerPrice;

    setOrderItems([...orderItems, {
      blanketModelId: parseInt(currentItem.blanketModelId),
      quantity: parseInt(currentItem.quantity),
      unitPrice: unitPrice
    }]);

    setCurrentItem({
      blanketModelId: '',
      quantity: 1,
      unitPrice: 0
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (orderItems.length === 0) {
      toast.error('Please add at least one item to the order');
      return;
    }

    try {
      const orderData = {
        distributorId: user.id,
        orderItems: orderItems.map(item => ({
          blanketModelId: item.blanketModelId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      const response = await createManufacturerOrder(orderData);
      toast.success('Order created successfully');
      
      // Call the onOrderCreated callback if provided
      if (onOrderCreated) {
        onOrderCreated(response);
      }
      
      // Close the popup
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Full error object:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create order';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Create New Manufacturer Order</h3>
        <button 
          type="button" 
          className="btn-close btn-close-white" 
          onClick={onClose}
          aria-label="Close"
        />
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} noValidate>
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label">Blanket Model</label>
              <select
                className="form-select"
                value={currentItem.blanketModelId}
                onChange={(e) => setCurrentItem({...currentItem, blanketModelId: e.target.value})}
              >
                <option value="">Select a model</option>
                {blanketModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} - LKR {model.manufacturerPrice.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleAddItem}
              >
                Add Item
              </button>
            </div>
          </div>

          {orderItems.length > 0 && (
            <>
              <h5 className="mb-3">Order Items</h5>
              <div className="table-responsive mb-4">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => {
                      const model = blanketModels.find(m => m.id === item.blanketModelId);
                      return (
                        <tr key={index}>
                          <td>{model?.name}</td>
                          <td>{item.quantity}</td>
                          <td>LKR {item.unitPrice.toFixed(2)}</td>
                          <td>LKR {(item.quantity * item.unitPrice).toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemoveItem(index)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end fw-bold">Grand Total:</td>
                      <td className="fw-bold">
                        LKR {orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={orderItems.length === 0}
            >
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateManufacturerOrder;