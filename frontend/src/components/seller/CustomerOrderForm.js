import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { useState } from 'react';

const CustomerOrderForm = ({ open, onClose, blanketModels, onSubmit }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    phone: ''
  });

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

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      customerInfo,
      orderItems,
      shippingAddress: customerInfo.address,
      contactPhone: customerInfo.phone
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Customer Order</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Customer Name"
          name="name"
          value={customerInfo.name}
          onChange={handleCustomerInfoChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Address"
          name="address"
          value={customerInfo.address}
          onChange={handleCustomerInfoChange}
          multiline
          rows={2}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Phone"
          name="phone"
          value={customerInfo.phone}
          onChange={handleCustomerInfoChange}
        />

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
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={orderItems.length === 0 || !customerInfo.name || !customerInfo.address}
        >
          Submit Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerOrderForm;