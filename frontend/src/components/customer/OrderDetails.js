import { Box, Chip, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import React from 'react';

const OrderDetails = ({ order }) => {
  const statusColors = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'secondary',
    Delivered: 'success',
    Cancelled: 'error'
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Order #{order.orderNumber}</Typography>
        <Chip label={order.status} color={statusColors[order.status]} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="subtitle2">Order Date</Typography>
          <Typography>{new Date(order.orderDate).toLocaleString()}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Total Amount</Typography>
          <Typography variant="h6">LKR {order.totalAmount.toFixed(2)}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Shipping Information</Typography>
        <Typography>Address: {order.shippingAddress}</Typography>
        <Typography>Contact: {order.contactPhone}</Typography>
        {order.notes && <Typography>Notes: {order.notes}</Typography>}
      </Box>

      <Typography variant="subtitle1" gutterBottom>Order Items</Typography>
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
                <TableCell align="right">LKR {(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderDetails;