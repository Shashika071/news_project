import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import React, { useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemove, 
  onUpdateQuantity, 
  onCheckout,
  sellers,
  user
}) => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState('');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.quantity * item.retailPrice), 
    0
  );

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) return;
    setCheckoutOpen(true);
  };

  const handleConfirmCheckout = () => {
    if (!selectedSeller || !shippingAddress || !contactPhone) return;
    
    const orderData = {
      sellerId: selectedSeller,
      shippingAddress,
      contactPhone,
      notes,
      orderItems: cartItems.map(item => ({
        blanketModelId: item.id,
        quantity: item.quantity,
        unitPrice: item.retailPrice
      }))
    };
    
    onCheckout(orderData);
    setCheckoutOpen(false);
  };

  return (
    <>
      <Drawer anchor="right" open={isOpen} onClose={onClose}>
        <Box sx={{ width: 350, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ShoppingCartIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Your Cart</Typography>
          </Box>
          <Divider />
          
          {cartItems.length === 0 ? (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1">Your cart is empty</Typography>
            </Box>
          ) : (
            <>
              <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                {cartItems.map((item) => (
                  <ListItem 
                    key={item.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => onRemove(item.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={item.name} 
                      secondary={`LKR ${item.retailPrice.toFixed(2)}`}
                    />
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                      inputProps={{ min: 1, style: { width: '50px', textAlign: 'center' } }}
                      size="small"
                      sx={{ mx: 1 }}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ mt: 'auto', pt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">LKR {totalAmount.toFixed(2)}</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={handleCheckoutClick}
                  disabled={cartItems.length === 0}
                >
                  Checkout
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            {cartItems.map(item => (
              <Box key={item.id} display="flex" justifyContent="space-between" mb={1}>
                <Typography>
                  {item.name} × {item.quantity}
                </Typography>
                <Typography>
                  LKR {(item.quantity * item.retailPrice).toFixed(2)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">LKR {totalAmount.toFixed(2)}</Typography>
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>Shipping Information</Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Seller</InputLabel>
            <Select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              label="Select Seller"
            >
              {sellers.map(seller => (
                <MenuItem key={seller.id} value={seller.id}>
                  {seller.businessName} ({seller.contactPerson})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            fullWidth
            label="Shipping Address"
            multiline
            rows={3}
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
          />

          <TextField
            margin="normal"
            fullWidth
            label="Contact Phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            required
          />

          <TextField
            margin="normal"
            fullWidth
            label="Notes (Optional)"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmCheckout}
            variant="contained" 
            disabled={!selectedSeller || !shippingAddress || !contactPhone}
          >
            Place Order
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CartDrawer;