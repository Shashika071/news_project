import { Box, Button, Grid, Paper, Tab, Tabs, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { createOrder, getOrders, updateOrderStatus } from '../../api/orderService';
import { getSellerInventory, updateSellerInventory } from '../../api/inventoryService';

import CustomerOrderForm from '../../components/seller/CustomerOrderForm';
import { DataGrid } from '@mui/x-data-grid';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { getBlanketModels } from '../../api/blanketService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [blanketModels, setBlanketModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openOrderForm, setOpenOrderForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryData, ordersData, modelsData] = await Promise.all([
        getSellerInventory(),
        getOrders(),
        getBlanketModels()
      ]);
      
      // Transform orders data to ensure all fields are properly set
      const transformedOrders = ordersData.map(order => ({
        ...order,
        customerName: order.customerName || 'Anonymous',
        sellerName: order.sellerName || user?.businessName || user?.username,
        totalAmount: order.totalAmount || order.orderItems?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0,
        orderDate: order.orderDate || new Date().toISOString()
      }));
      
      setInventory(inventoryData);
      setOrders(transformedOrders);
      setBlanketModels(modelsData);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (blanketModelId, quantity) => {
    try {
      await updateSellerInventory(blanketModelId, quantity);
      toast.success('Inventory updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update inventory');
      console.error(error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error(error);
    }
  };

  const handleCreateOrder = async (orderData) => {
    try {
      // Add seller ID to the order data
      const orderWithSeller = {
        ...orderData,
        sellerId: user.id,
        customerId: user.id, // Seller is creating order for themselves
        status: 'Processing' // Set initial status
      };
      
      await createOrder(orderWithSeller);
      toast.success('Order created successfully');
      setOpenOrderForm(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create order');
      console.error(error);
    }
  };

  const inventoryColumns = [
    { 
      field: 'blanketModelName', 
      headerName: 'Product', 
      width: 250,
      valueGetter: (params) => {
        const model = blanketModels.find(b => b.id === params.row.blanketModelId);
        return model ? model.name : params.row.blanketModelName || 'Unknown';
      }
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      width: 150,
      editable: true
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleUpdateInventory(params.row.blanketModelId, params.row.quantity)}
          disabled={loading}
        >
          Update
        </Button>
      )
    }
  ];

  const orderColumns = [
    { field: 'orderNumber', headerName: 'Order #', width: 150 },
    { 
      field: 'orderDate', 
      headerName: 'Date', 
      width: 150, 
      valueFormatter: (params) => {
        try {
          return params.value ? new Date(params.value).toLocaleDateString() : 'N/A';
        } catch {
          return 'Invalid Date';
        }
      }
    },
    { field: 'customerName', headerName: 'Customer', width: 200 },
    { 
      field: 'totalAmount', 
      headerName: 'Total', 
      width: 120, 
      valueFormatter: (params) => {
        const amount = Number(params.value);
        return !isNaN(amount) ? `LKR ${amount.toFixed(2)}` : 'LKR 0.00';
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 200,
      renderCell: (params) => {
        const statusOptions = {
          Pending: ['Processing', 'Cancelled'],
          Processing: ['Shipped', 'Cancelled'],
          Shipped: ['Delivered']
        };

        const currentStatus = params.value || 'Pending';
        const availableOptions = statusOptions[currentStatus] || [];

        return (
          <select
            className="form-select form-select-sm"
            value={currentStatus}
            onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
            disabled={loading}
          >
            <option value={currentStatus}>{currentStatus}</option>
            {availableOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Button 
          size="small" 
          variant="outlined"
          onClick={() => {
            // Implement order details view
            console.log('View order details', params.row);
          }}
          disabled={loading}
        >
          Details
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Seller Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {user?.businessName || user?.username}
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Inventory" icon={<InventoryIcon />} />
        <Tab label="Orders" icon={<PointOfSaleIcon />} />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Current Inventory</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<PointOfSaleIcon />}
                  onClick={() => setOpenOrderForm(true)}
                  disabled={loading}
                >
                  Create Order
                </Button>
              </Box>
              <div style={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={inventory}
                  columns={inventoryColumns}
                  loading={loading}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  getRowId={(row) => row.blanketModelId}
                  disableSelectionOnClick
                />
              </div>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Customer Orders
              </Typography>
              <div style={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={orders}
                  columns={orderColumns}
                  loading={loading}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  getRowId={(row) => row.id}
                  disableSelectionOnClick
                />
              </div>
            </Paper>
          </Grid>
        </Grid>
      )}

      <CustomerOrderForm
        open={openOrderForm}
        onClose={() => setOpenOrderForm(false)}
        blanketModels={blanketModels.filter(model => 
          inventory.some(item => item.blanketModelId === model.id && item.quantity > 0)
        )}
        onSubmit={handleCreateOrder}
        loading={loading}
      />
    </Box>
  );
};

export default SellerDashboard;