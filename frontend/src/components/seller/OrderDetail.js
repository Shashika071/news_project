import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getOrderById, updateOrderStatus } from '../../api/orderService';
import { useNavigate, useParams } from 'react-router-dom';

import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error('Error details:', error);
        toast.error('Failed to fetch order details: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      toast.success('Order status updated');
      const updatedOrder = await getOrderById(id);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading order details...</Typography>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Order not found or failed to load</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  const statusColors = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'secondary',
    Delivered: 'success',
    Cancelled: 'error'
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        variant="outlined" 
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Orders
      </Button>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Order #{order.orderNumber}</Typography>
            <Chip 
              label={order.status} 
              color={statusColors[order.status] || 'default'}
            />
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Customer Information</Typography>
              <Typography><strong>Name:</strong> {order.customerName || 'Not specified'}</Typography>
              <Typography><strong>Contact:</strong> {order.contactPhone || 'Not specified'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Order Information</Typography>
              <Typography><strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}</Typography>
              <Typography><strong>Status:</strong> 
                <Select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  size="small"
                  sx={{ ml: 1, minWidth: 120 }}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Shipped">Shipped</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" gutterBottom>Shipping Address</Typography>
          <Typography paragraph>{order.shippingAddress || 'Not specified'}</Typography>

          {order.notes && (
            <>
              <Typography variant="subtitle1" gutterBottom>Notes</Typography>
              <Typography paragraph>{order.notes}</Typography>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Order Items</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.orderItems.map((item) => (
                  <TableRow key={item.blanketModelId}>
                    <TableCell>
                      <Typography fontWeight="bold">{item.blanketModelName}</Typography>
                    </TableCell>
                    <TableCell align="right">LKR {item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">LKR {item.totalPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Order Total: LKR {order.totalAmount.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(-1)}
            >
              Back to Orders
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderDetail;