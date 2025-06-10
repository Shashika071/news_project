import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import StatusBadge from '../../common/StatusBadge';
import { getManufacturerOrder } from '../../api/manufacturerOrderService';
import { toast } from 'react-hot-toast';

const ManufacturerOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getManufacturerOrder(id);
      setOrder(data);
    } catch (error) {
      toast.error('Failed to fetch order details');
      console.error(error);
    } finally {
      setLoading(false);
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

  if (!order) {
    return <div className="alert alert-danger">Order not found</div>;
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Order Details: {order.orderNumber}</h3>
        <button className="btn btn-light btn-sm" onClick={() => navigate('/manufacturer/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
      <div className="card-body">
        <div className="row mb-4">
          <div className="col-md-6">
            <h5>Order Information</h5>
            <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
            <p><strong>Status:</strong> <StatusBadge status={order.status} /></p>
          </div>
          <div className="col-md-6">
            <h5>Distributor Information</h5>
            <p><strong>Name:</strong> {order.distributorName}</p>
            {order.approvedDate && (
              <p><strong>Approved:</strong> {new Date(order.approvedDate).toLocaleString()} by {order.approvedByName}</p>
            )}
          </div>
        </div>

        <h5 className="mb-3">Order Items</h5>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr key={item.blanketModelId}>
                  <td>{item.blanketModelName}</td>
                  <td>{item.quantity}</td>
                  <td>LKR {item.unitPrice.toFixed(2)}</td>
                  <td>LKR {item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end fw-bold">Grand Total:</td>
                <td className="fw-bold">LKR {order.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerOrderDetails;
