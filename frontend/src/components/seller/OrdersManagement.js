import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, MenuItem, Select, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '../../api/orderService';

import { DataGrid } from '@mui/x-data-grid';
import OrderDetails from '../customer/OrderDetails';
import { useAuth } from '../../contexts/AuthContext';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const columns = [
    { field: 'orderNumber', headerName: 'Order #', width: 150 },
    { field: 'orderDate', headerName: 'Date', width: 150, 
      valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
    { field: 'customerName', headerName: 'Customer', width: 200 },
    { field: 'totalAmount', headerName: 'Total', width: 120, 
      valueFormatter: (params) => `LKR ${params.value.toFixed(2)}` },
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

        return (
          <Select
            value={params.value}
            onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value={params.value} disabled>
              {params.value}
            </MenuItem>
            {statusOptions[params.value]?.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
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
            setSelectedOrder(params.row);
            setOpenDialog(true);
          }}
        >
          Details
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Customer Orders
      </Typography>
      
      <DataGrid
        rows={orders}
        columns={columns}
        loading={loading}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        getRowId={(row) => row.id}
        disableSelectionOnClick
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && <OrderDetails order={selectedOrder} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OrdersManagement;