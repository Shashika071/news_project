import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useState } from 'react';

const BlanketModelForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialValues = {
    name: '',
    description: '',
    material: '',
    size: '',
    weight: 0,
    manufacturerPrice: 0,
    retailPrice: 0,
    imageUrl: '',
    isActive: true
  }
}) => {
  const [formData, setFormData] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' || name.includes('Price') ? parseFloat(value) : value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialValues.id ? 'Edit Blanket Model' : 'Add Blanket Model'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Material"
          name="material"
          value={formData.material}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Size"
          name="size"
          value={formData.size}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Weight (kg)"
          name="weight"
          type="number"
          value={formData.weight}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Manufacturer Price"
          name="manufacturerPrice"
          type="number"
          value={formData.manufacturerPrice}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Retail Price"
          name="retailPrice"
          type="number"
          value={formData.retailPrice}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Image URL"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlanketModelForm;