import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getDistributorInventory, updateDistributorInventory } from '../../api/inventoryService';
import { getDistributorOrders, updateDistributorOrderStatus } from '../../api/orderService';

import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import CreateManufacturerOrder from '../../components/manufacturer/CreateManufacturerOrder';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import InventoryIcon from '@mui/icons-material/Inventory';
import SaveIcon from '@mui/icons-material/Save';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getBlanketModels } from '../../api/blanketService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const DistributorDashboard = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [blanketModels, setBlanketModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openOrderForm, setOpenOrderForm] = useState(false);
  const [editQuantity, setEditQuantity] = useState({ id: null, value: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryData, ordersData, modelsData] = await Promise.all([
        getDistributorInventory(),
        getDistributorOrders(),
        getBlanketModels(),
      ]);
      
      setInventory(inventoryData);
      setOrders(ordersData);
      setBlanketModels(modelsData);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (blanketModelId, quantity) => {
    try {
      if (quantity < 0) {
        toast.error('Quantity cannot be negative');
        return;
      }
      await updateDistributorInventory(blanketModelId, quantity);
      toast.success('Inventory updated successfully');
      fetchData();
      setEditQuantity({ id: null, value: '' });
    } catch (error) {
      toast.error('Failed to update inventory');
      console.error(error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
  try {
    await updateDistributorOrderStatus(orderId, newStatus);
    toast.success(`Order status updated to ${newStatus}`);
    
    // Update local state immediately for better UX
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    // Refresh data to ensure consistency
    setTimeout(fetchData, 500);
  } catch (error) {
    toast.error(error.message || 'Failed to update order status');
    console.error('Status update error:', error);
  }
};

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'warning';
      case 'Processing': return 'info';
      case 'Shipped': return 'success';
      case 'Delivered': return 'secondary';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const inventoryColumns = [
    { 
      field: 'blanketModelName', 
      headerName: 'Product', 
      flex: 1,
      minWidth: 350,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          py: 1,
          width: '100%',
          height: '100%',
          gap: 4
        }}>
          {params.row.imageUrl ? (
            <Avatar 
              src={params.row.imageUrl} 
              alt={params.row.blanketModelName}
              sx={{ 
                width: 75, 
                height: 75, 
                boxShadow: 2,
                flexShrink: 0
              }}
            />
          ) : (
            <Avatar sx={{ 
              width: 50, 
              height: 50, 
              bgcolor: 'primary.main',
              flexShrink: 0
            }}>
              <InventoryIcon />
            </Avatar>
          )}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
            flex: 1
          }}>
            <Typography 
              variant="subtitle1" 
              fontWeight="600" 
              sx={{ 
                lineHeight: 1.2,
                mb: 0.5,
                color: 'text.primary'
              }}
            >
              {params.row.blanketModelName || 'Unnamed Product'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              SKU: {params.row.blanketModelId || 'N/A'}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'quantity', 
      headerName: 'Stock Level', 
      width: 220,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 1,
          width: '100%',
          height: '100%'
        }}>
          {editQuantity.id === params.row.blanketModelId ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="number"
                value={editQuantity.value}
                onChange={(e) => setEditQuantity({
                  id: params.row.blanketModelId,
                  value: e.target.value
                })}
                style={{ 
                  width: 70, 
                  padding: '8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}
                min="0"
              />
              <Tooltip title="Save">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleUpdateInventory(
                    params.row.blanketModelId, 
                    parseInt(editQuantity.value)
                  )}
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setEditQuantity({ id: null, value: '' })}
                >
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={params.row.quantity || 0}
                color={params.row.quantity > 10 ? 'success' : params.row.quantity > 5 ? 'warning' : 'error'}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <Tooltip title="Edit Quantity">
                <IconButton
                  size="small"
                  onClick={() => setEditQuantity({
                    id: params.row.blanketModelId,
                    value: params.row.quantity || 0
                  })}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const quantity = params.row.quantity || 0;
        const status = quantity > 10 ? 'In Stock' : quantity > 0 ? 'Low Stock' : 'Out of Stock';
        const color = quantity > 10 ? 'success' : quantity > 0 ? 'warning' : 'error';
        
        return (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%'
          }}>
            <Chip 
              label={status}
              color={color}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        );
      }
    }
  ];

  const orderColumns = [
    { 
      field: 'orderNumber', 
      headerName: 'Order #', 
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}>
          <Typography variant="body2" fontWeight="600" color="primary">
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'sellerName', 
      headerName: 'Seller', 
      width: 200,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main' }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}>
          <Chip
            label={params.value}
            color={getStatusColor(params.value)}
            size="small"
            variant="filled"
          />
        </Box>
      )
    },
    { 
      field: 'totalAmount', 
      headerName: 'Total', 
      width: 140,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}>
          <Typography variant="body2" fontWeight="600">
            LKR {params.value?.toFixed(2)}
          </Typography>
        </Box>
      )
    },
   {
  field: 'actions',
  headerName: 'Update Status',
  width: 200,
  headerAlign: 'center',
  align: 'center',
  renderCell: (params) => {
    const statusOptions = {
      Pending: ['Processing', 'Cancelled'],
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered']
    };

    const currentStatus = params.row.status || 'Pending';
    const availableOptions = statusOptions[currentStatus] || [];
    
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}>
        <select
          value={currentStatus}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          disabled={availableOptions.length === 0}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            backgroundColor: 'white',
            cursor: availableOptions.length > 0 ? 'pointer' : 'default',
            minWidth: '120px',
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          <option value={currentStatus}>{currentStatus}</option>
          {availableOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </Box>
    );
  }
},
    {
      field: 'details',
      headerName: 'Details',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}>
          <Tooltip title="View Order Details">
            <IconButton
              color="primary"
              onClick={() => setSelectedOrder(params.row)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const stats = [
    {
      title: 'Total Products',
      value: inventory.length,
      icon: <InventoryIcon />,
      color: 'primary'
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: <ShoppingCartIcon />,
      color: 'secondary'
    },
    {
      title: 'Low Stock Items',
      value: inventory.filter(item => item.quantity <= 5).length,
      icon: <TrendingUpIcon />,
      color: 'warning'
    }
  ];

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" color="text.primary" gutterBottom>
          Distributor Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Welcome back, {user?.businessName || user?.username}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: 3,
              '&:hover': {
                transform: 'translateY(-2px)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="700">
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 56, 
                    height: 56 
                  }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)} 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 600,
              minHeight: 64
            }
          }}
        >
          <Tab 
            label="Inventory Management" 
            icon={<InventoryIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Orders Management" 
            icon={<ShoppingCartIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* Inventory Tab */}
      {activeTab === 0 && (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="600">
                Current Inventory
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setOpenOrderForm(true)}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  fontSize: '16px'
                }}
              >
                Create Manufacturer Order
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={inventory}
                columns={inventoryColumns}
                loading={loading}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                getRowId={(row) => row.blanketModelId}
                disableSelectionOnClick
                disableColumnMenu
                disableColumnSelector
                disableDensitySelector
                disableColumnFilter
                sx={{
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '40px 16px',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8fafc',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderBottom: '2px solid #e5e7eb',
                  },
                  '& .MuiDataGrid-row': {
                    minHeight: '80px !important',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                    }
                  },
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                  '& .MuiDataGrid-row:nth-of-type(even)': {
                    backgroundColor: '#fafbfc',
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Orders Tab */}
      {activeTab === 1 && (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Orders Management
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={orders}
                columns={orderColumns}
                loading={loading}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                getRowId={(row) => row.id}
                disableSelectionOnClick
                disableColumnMenu
                disableColumnSelector
                disableDensitySelector
                disableColumnFilter
                sx={{
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8fafc',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 600,
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f8fafc',
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Create Order Dialog */}
      <Dialog
        open={openOrderForm}
        onClose={() => setOpenOrderForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <CreateManufacturerOrder
          onClose={() => setOpenOrderForm(false)}
          blanketModels={blanketModels}
          onSubmit={() => {
            setOpenOrderForm(false);
            fetchData();
          }}
        />
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="600" gutterBottom>
              Order Details
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              {selectedOrder?.orderNumber}
            </Typography>
            
            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Seller</Typography>
                <Typography variant="h6">{selectedOrder?.sellerName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Order Date</Typography>
                <Typography variant="h6">
                  {selectedOrder?.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : ''}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedOrder?.status}
                  color={getStatusColor(selectedOrder?.status)}
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Total Amount</Typography>
                <Typography variant="h6" color="primary">
                  LKR {selectedOrder?.totalAmount?.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Order Items
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {selectedOrder?.orderItems?.map((item, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight="600">
                          {item.blanketModelName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" color="text.secondary">Qty</Typography>
                        <Typography variant="h6">{item.quantity}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" color="text.secondary">Unit Price</Typography>
                        <Typography variant="body1">LKR {item.unitPrice?.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Typography variant="body2" color="text.secondary">Total</Typography>
                        <Typography variant="h6" color="primary">
                          LKR {item.totalPrice?.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                onClick={() => setSelectedOrder(null)}
                sx={{ borderRadius: 2, px: 3, py: 1.5 }}
              >
                Close
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Dialog>
    </Box>
  );
};

export default DistributorDashboard;