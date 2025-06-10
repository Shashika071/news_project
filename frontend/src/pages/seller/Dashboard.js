import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  createDistributorOrder,
  getOrderById,
  getOrders,
  updateOrderStatus
} from '../../api/orderService';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getBlanketModels } from '../../api/blanketService';
import { getDistributors } from '../../api/usersService';
import { getSellerInventory } from '../../api/inventoryService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState({
    orders: false,
    inventory: false,
    all: false
  });

  // For distributor orders
  const [showDistributorOrderForm, setShowDistributorOrderForm] = useState(false);
  const [blanketModels, setBlanketModels] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState('');

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading({ orders: true, inventory: true, all: true });
      
      const [inventoryData, ordersData] = await Promise.all([
        getSellerInventory(),
        getOrders()
      ]);

      setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(`Failed to fetch data: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading({ orders: false, inventory: false, all: false });
    }
  };

  // Fetch distributor order data
  const fetchDistributorOrderData = async () => {
    try {
      const [models, distributors] = await Promise.all([
        getBlanketModels(),
        getDistributors()
      ]);
      setBlanketModels(models);
      setDistributors(distributors);
    } catch (error) {
      toast.error('Failed to fetch distributor order data');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDistributorOrderData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const order = await getOrderById(orderId);
      setSelectedOrder(order);
      setActiveTab('orderDetail');
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  // Distributor order functions
  const handleAddDistributorItem = () => {
    setOrderItems([...orderItems, {
      blanketModelId: '',
      quantity: 1,
      unitPrice: 0
    }]);
  };

  const handleRemoveDistributorItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleDistributorItemChange = (index, field, value) => {
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

  const handleCreateDistributorOrder = async (e) => {
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
      toast.success('Distributor order created successfully');
      setShowDistributorOrderForm(false);
      setOrderItems([]);
      setSelectedDistributor('');
      fetchData(); // Refresh orders
    } catch (error) {
      toast.error('Failed to create distributor order');
      console.error(error);
    }
  };

  const calculateDistributorOrderTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const statusColors = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'secondary',
    Delivered: 'success',
    Cancelled: 'error'
  };

  // Loading component
  const LoadingIndicator = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Seller Dashboard
      </Typography>

      {showDistributorOrderForm ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Create Distributor Order</Typography>
              <Button 
                variant="outlined" 
                onClick={() => setShowDistributorOrderForm(false)}
              >
                Back to Dashboard
              </Button>
            </Box>

            <form onSubmit={handleCreateDistributorOrder}>
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
                  onClick={handleAddDistributorItem}
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
                              onChange={(e) => handleDistributorItemChange(index, 'blanketModelId', e.target.value)}
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
                              onChange={(e) => handleDistributorItemChange(index, 'quantity', e.target.value)}
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
                            <IconButton onClick={() => handleRemoveDistributorItem(index)}>
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
                  Order Total: LKR {calculateDistributorOrderTotal().toFixed(2)}
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
      ) : (
        <>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Orders" value="orders" />
            <Tab label="Inventory" value="inventory" />
            {selectedOrder && <Tab label="Order Details" value="orderDetail" />}
          </Tabs>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5">My Orders</Typography>
                  <Box>
                    <Button onClick={fetchData} size="small" sx={{ mr: 2 }}>
                      Refresh
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={() => setShowDistributorOrderForm(true)}
                    >
                      Create Distributor Order
                    </Button>
                  </Box>
                </Box>

                {loading.all ? (
                  <LoadingIndicator />
                ) : orders.length === 0 ? (
                  <Typography color="textSecondary">No orders found</Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order #</TableCell>
                          <TableCell>Date</TableCell>
                         
                          <TableCell align="right">Total</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.orderNumber}</TableCell>
                            <TableCell>
                              {new Date(order.orderDate).toLocaleDateString()}
                            </TableCell>
                             
                            <TableCell align="right">LKR {order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                size="small"
                                sx={{ minWidth: 120 }}
                              >
                                {Object.keys(statusColors).map(status => (
                                  <MenuItem key={status} value={status}>{status}</MenuItem>
                                ))}
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="small" 
                                onClick={() => handleViewOrderDetails(order.id)}
                              >
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5">My Inventory</Typography>
                  <Button onClick={fetchData} size="small">
                    Refresh
                  </Button>
                </Box>

                {loading.all ? (
                  <LoadingIndicator />
                ) : inventory.length === 0 ? (
                  <Typography color="textSecondary">No inventory items found</Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Available</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inventory.map((item) => (
                          <TableRow key={item.blanketModelId}>
                            <TableCell>
                              {item.blanketModelName || `Product ID: ${item.blanketModelId}`}
                            </TableCell>
                            <TableCell align="right">
                              {item.quantity || 0}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Detail View */}
          {activeTab === 'orderDetail' && selectedOrder && (
            <OrderDetailView 
              order={selectedOrder} 
              onBack={() => setActiveTab('orders')}
              onStatusChange={handleStatusChange}
              statusColors={statusColors}
            />
          )}

          {/* Stats Section */}
          <DashboardStats 
            orders={orders} 
            inventory={inventory} 
            onRefresh={fetchData} 
          />
        </>
      )}
    </Box>
  );
};

// Sub-component for Order Details
const OrderDetailView = ({ order, onBack, onStatusChange, statusColors }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Order #{order.orderNumber}</Typography>
        <Button variant="outlined" onClick={onBack}>
          Back to Orders
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">Tel No.</Typography>
         
          <Typography>{order.contactPhone}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">Status</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={order.status} color={statusColors[order.status]} />
            <Select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              size="small"
            >
              {Object.keys(statusColors).map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </Box>
        </Grid>
      </Grid>

      <Typography variant="subtitle1">Shipping Address</Typography>
      <Typography paragraph>{order.shippingAddress}</Typography>

      {order.notes && (
        <>
          <Typography variant="subtitle1">Notes</Typography>
          <Typography paragraph>{order.notes}</Typography>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">Items</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.orderItems?.map((item) => (
              <TableRow key={item.blanketModelId}>
                <TableCell>{item.blanketModelName}</TableCell>
                <TableCell align="right">LKR {item.unitPrice?.toFixed(2) || '0.00'}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">LKR {(item.quantity * item.unitPrice)?.toFixed(2) || '0.00'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="h6">
          Total: LKR {order.totalAmount?.toFixed(2) || '0.00'}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Sub-component for Stats
const DashboardStats = ({ orders, inventory, onRefresh }) => (
  <Grid container spacing={2} sx={{ mt: 2 }}>
    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6">Orders Summary</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography>Pending: {orders.filter(o => o.status === 'Pending').length}</Typography>
            <Typography>Total: {orders.length}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6">Inventory Summary</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography>Products: {inventory.length}</Typography>
            <Typography>Total Items: {inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6">Quick Actions</Typography>
          <Button 
            variant="contained" 
            size="small" 
            sx={{ mt: 1 }}
            onClick={onRefresh}
          >
            Refresh All Data
          </Button>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

export default SellerDashboard;