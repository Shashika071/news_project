import React, { useEffect, useState } from 'react';
import {
  getManufacturerInventory,
  updateManufacturerInventory
} from '../../api/inventoryService';

import { toast } from 'react-hot-toast';

const ManufacturerInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(0);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getManufacturerInventory();
      setInventory(data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.blanketModelId);
    setTempQuantity(item.quantity);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (blanketModelId) => {
    try {
      await updateManufacturerInventory(blanketModelId, tempQuantity);
      toast.success('Inventory updated successfully');
      fetchInventory();
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to update inventory');
      console.error(error);
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
    <div className="inventory-card p-4 mb-4">
      <h3 className="fw-bold mb-4">📦 Manufacturer Inventory</h3>
      <div className="table-responsive">
        <table className="table inventory-table">
          <thead>
            <tr>
              <th className="fw-bold py-3">Blanket Model</th>
              <th className="fw-bold py-3">Current Stock</th>
              <th className="fw-bold py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.blanketModelId}>
                <td className="align-middle py-3">
                  <strong>{item.blanketModelName}</strong>
                </td>
                <td className="align-middle py-3">
                  {editingId === item.blanketModelId ? (
                    <input
                      type="number"
                      className="form-control"
                      value={tempQuantity}
                      onChange={(e) => setTempQuantity(parseInt(e.target.value))}
                      min="0"
                      style={{ width: '100px' }}
                    />
                  ) : (
                    <span className="badge bg-primary rounded-pill fs-6">
                      {item.quantity} units
                    </span>
                  )}
                </td>
                <td className="align-middle py-3">
                  {editingId === item.blanketModelId ? (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm fw-semibold"
                        onClick={() => handleSaveEdit(item.blanketModelId)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm fw-semibold"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline-primary btn-sm fw-semibold"
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManufacturerInventory;