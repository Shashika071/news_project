import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const OrderForm = ({ open, onClose, blanketModels, sellers, onSubmit }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { blanketModelId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'blanketModelId') {
      const selectedModel = blanketModels.find(b => b.id === value);
      if (selectedModel) {
        newItems[index].unitPrice = selectedModel.distributorPrice;
      }
    }
    
    setOrderItems(newItems);
  };

  const handleSubmit = () => {
    const orderData = {
      sellerId: selectedSeller.id,
      orderItems: orderItems.map(item => ({
        blanketModelId: item.blanketModelId,
        quantity: parseInt(item.quantity, 10),
        unitPrice: parseFloat(item.unitPrice)
      }))
    };
    onSubmit(orderData);
  };

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice), 
    0
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Distributor Order</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            options={sellers}
            getOptionLabel={(option) => option.businessName || option.username}
            value={selectedSeller}
            onChange={(event, newValue) => setSelectedSeller(newValue)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Select Seller" 
                variant="outlined" 
                fullWidth 
                required 
              />
            )}
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        
        <Button 
          startIcon={<AddCircleOutlineIcon />} 
          onClick={handleAddItem}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Add Item
        </Button>

        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Autocomplete
                      options={blanketModels}
                      getOptionLabel={(option) => option.name}
                      value={blanketModels.find(b => b.id === item.blanketModelId) || null}
                      onChange={(event, newValue) => 
                        handleItemChange(index, 'blanketModelId', newValue?.id || '')
                      }
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          variant="standard" 
                          placeholder="Select product" 
                          required 
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell align="right">
                    LKR {item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconButton 
                        onClick={() => 
                          handleItemChange(index, 'quantity', Math.max(1, item.quantity - 1))
                        }
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => 
                          handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))
                        }
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                        sx={{ width: 60 }}
                      />
                      <IconButton 
                        onClick={() => 
                          handleItemChange(index, 'quantity', item.quantity + 1)
                        }
                      >
                        <AddCircleOutlineIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    LKR {(item.quantity * item.unitPrice).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleRemoveItem(index)}>
                      <DeleteOutlineIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="h6">
            Total: LKR {totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!selectedSeller || orderItems.length === 0}
        >
          Place Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderForm;