import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getBlanketModels } from '../../api/blanketService';
import { getSellerInventory } from '../../api/inventoryService';
import { toast } from 'react-hot-toast';
import { updateSellerInventory } from '../../api/inventoryService';
import { useAuth } from '../../contexts/AuthContext';

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blanketModels, setBlanketModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    blanketModelId: '',
    quantity: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const models = await getBlanketModels();
        setBlanketModels(models.filter(m => m.isActive));

        if (id) {
          const inventoryItem = await getSellerInventory (id);
          setFormData({
            blanketModelId: inventoryItem.blanketModelId,
            quantity: inventoryItem.quantity
          });
        }
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateSellerInventory({
        sellerId: user.id,
        blanketModelId: formData.blanketModelId,
        quantity: formData.quantity
      });
      
      toast.success(id ? 'Inventory updated' : 'Inventory item added');
      navigate('/seller/inventory');
    } catch (error) {
      toast.error('Failed to save inventory');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Inventory Item' : 'Add Inventory Item'}
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Select
                  fullWidth
                  name="blanketModelId"
                  value={formData.blanketModelId}
                  onChange={handleChange}
                  required
                  disabled={!!id}
                >
                  <MenuItem value="" disabled>
                    Select Blanket Model
                  </MenuItem>
                  {blanketModels.map(model => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name} ({model.material})
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/seller/inventory')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={!formData.blanketModelId || formData.quantity < 0}
              >
                {id ? 'Update' : 'Add'} Inventory
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InventoryForm;