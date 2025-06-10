import React, { useEffect, useState } from 'react';
import { approveManufacturerOrder, completeManufacturerOrder, getManufacturerOrders } from '../../api/manufacturerOrderService';

import { Link } from 'react-router-dom';
import StatusBadge from '../../common/StatusBadge';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const ManufacturerOrdersList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getManufacturerOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
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

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h3 className="mb-0">Manufacturer Orders</h3>
      </div>
      <div className="card-body">
        {user.role === 'Distributor' && (
          <div className="mb-4">
            <Link to="/manufacturer-orders/new" className="btn btn-success">
              Create New Order
            </Link>
          </div>
        )}
        
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                {user.role === 'Manufacturer' && <th>Distributor</th>}
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  {user.role === 'Manufacturer' && <td>{order.distributorName}</td>}
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>LKR {order.totalAmount.toFixed(2)}</td>
                  <td>
                    <Link 
                      to={`/manufacturer-orders/${order.id}`}
                      className="btn btn-sm btn-primary me-2"
                    >
                      View
                    </Link>
                    {user.role === 'Manufacturer' && order.status === 'Pending' && (
                      <button 
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleApprove(order.id)}
                      >
                        Approve
                      </button>
                    )}
                    {user.role === 'Manufacturer' && order.status === 'Approved' && (
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => handleComplete(order.id)}
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  async function handleApprove(id) {
    try {
      await approveManufacturerOrder(id);
      toast.success('Order approved successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to approve order');
      console.error(error);
    }
  }

  async function handleComplete(id) {
    try {
      await completeManufacturerOrder(id);
      toast.success('Order completed successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to complete order');
      console.error(error);
    }
  }
};

export default ManufacturerOrdersList;