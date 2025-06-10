import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { createDistributorOrder } from '../../api/orderService';
import { getBlanketModels } from '../../api/blanketService';
import { getDistributors } from '../../api/usersService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateDistributorOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blanketModels, setBlanketModels] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [models, distributors] = await Promise.all([
          getBlanketModels(),
          getDistributors()
        ]);
        setBlanketModels(models);
        setDistributors(distributors);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddItem = () => {
    setOrderItems([...orderItems, {
      blanketModelId: '',
      quantity: 1,
      unitPrice: 0
    }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    
    if (field === 'blanketModelId') {
      const selectedModel = blanketModels.find(b => b.id === parseInt(value));
      if (selectedModel) {
        newItems[index] = {
          ...newItems[index],
          blanketModelId: parseInt(value),
          unitPrice: selectedModel.retailPrice,
          quantity: newItems[index].quantity || 1
        };
      }
    } else if (field === 'quantity') {
      newItems[index] = {
        ...newItems[index],
        quantity: parseInt(value) || 0
      };
    }
    
    setOrderItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDistributor) {
      toast.error('Please select a distributor');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one item to the order');
      return;
    }

    try {
      const orderData = {
        sellerId: user.id,
        distributorId: selectedDistributor,
        orderItems: orderItems.map(item => ({
          blanketModelId: item.blanketModelId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      await createDistributorOrder(orderData);
      toast.success('Order created successfully');
      navigate('/seller/orders');
    } catch (error) {
      toast.error('Failed to create order');
      console.error(error);
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Distributor Order
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Distributor
                </Typography>
                <Select
                  fullWidth
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                  displayEmpty
                  required
                >
                  <MenuItem value="" disabled>
                    Select Distributor
                  </MenuItem>
                  {distributors.map(distributor => (
                    <MenuItem key={distributor.id} value={distributor.id}>
                      {distributor.businessName || distributor.username}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Order Items</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
              >
                Add Item
              </Button>
            </Box>

            {orderItems.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            fullWidth
                            value={item.blanketModelId}
                            onChange={(e) => handleItemChange(index, 'blanketModelId', e.target.value)}
                            required
                          >
                            <MenuItem value="" disabled>
                              Select Product
                            </MenuItem>
                            {blanketModels.map(model => (
                              <MenuItem key={model.id} value={model.id}>
                                {model.name} (SKU: {model.sku})
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            inputProps={{ min: 1 }}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.unitPrice.toFixed(2)}
                            disabled
                            fullWidth
                            InputProps={{
                              inputProps: {
                                style: { textAlign: 'right' }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          LKR {(item.quantity * item.unitPrice).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleRemoveItem(index)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                No items added to the order
              </Typography>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Order Total: LKR {calculateTotal().toFixed(2)}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={orderItems.length === 0 || !selectedDistributor}
              >
                Place Order
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateDistributorOrder;