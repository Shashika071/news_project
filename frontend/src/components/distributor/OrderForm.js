import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { useState } from 'react';

const OrderForm = ({ open, onClose, blanketModels, onSubmit }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddItem = () => {
    if (selectedModel && quantity > 0) {
      const model = blanketModels.find(m => m.id === parseInt(selectedModel));
      setOrderItems([...orderItems, {
        blanketModelId: parseInt(selectedModel),
        quantity,
        unitPrice: model.retailPrice
      }]);
      setSelectedModel('');
      setQuantity(1);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      sellerId: 1, // You'll need to get this from context or props
      orderItems
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Order</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Blanket Model</InputLabel>
          <Select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            label="Blanket Model"
          >
            {blanketModels.map((model) => (
              <MenuItem key={model.id} value={model.id}>
                {model.name} (${model.retailPrice})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
        <Button onClick={handleAddItem} variant="contained" sx={{ mt: 2 }}>
          Add Item
        </Button>
        
        {/* Display added items */}
        {orderItems.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Order Items</h4>
            <ul>
              {orderItems.map((item, index) => {
                const model = blanketModels.find(m => m.id === item.blanketModelId);
                return (
                  <li key={index}>
                    {model?.name || 'Unknown'} - {item.quantity} x ${item.unitPrice}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={orderItems.length === 0}>
          Submit Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderForm;