import { Box, Button, Divider, Drawer, IconButton, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import React from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const CartDrawer = ({ isOpen, onClose, cartItems, onRemove, onUpdateQuantity, onCheckout }) => {
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.quantity * item.retailPrice), 
    0
  );

  return (
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
                onClick={onCheckout}
                disabled={cartItems.length === 0}
              >
                Checkout
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;