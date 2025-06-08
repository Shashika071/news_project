import { Box, Button, Grid, Paper, Tab, Tabs, Typography } from '@mui/material';
import { getSellerInventory, updateSellerInventory } from '../../api/inventoryService';
import { useEffect, useState } from 'react';

import CustomerOrderForm from '../../components/seller/CustomerOrderForm';
import { DataGrid } from '@mui/x-data-grid';
import InventoryIcon from '@mui/icons-material/Inventory';
import InventoryTable from '../../components/seller/InventoryTable';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { getBlanketModels } from '../../api/blanketService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [blanketModels, setBlanketModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openOrderForm, setOpenOrderForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryData, modelsData] = await Promise.all([
        getSellerInventory(),
        getBlanketModels()
      ]);
      setInventory(inventoryData);
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
      await updateSellerInventory(blanketModelId, quantity);
      toast.success('Inventory updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update inventory');
      console.error(error);
    }
  };

  const handleCreateOrder = () => {
    setOpenOrderForm(true);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Seller Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {user?.businessName || user?.username}
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Inventory" icon={<InventoryIcon />} />
        <Tab label="Orders" icon={<PointOfSaleIcon />} />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Current Inventory</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<PointOfSaleIcon />}
                  onClick={handleCreateOrder}
                >
                  Create Order
                </Button>
              </Box>
              <InventoryTable
                inventory={inventory}
                blanketModels={blanketModels}
                loading={loading}
                onUpdate={handleUpdateInventory}
              />
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Customer Orders
              </Typography>
              {/* Orders table will go here */}
            </Paper>
          </Grid>
        </Grid>
      )}

      <CustomerOrderForm
        open={openOrderForm}
        onClose={() => setOpenOrderForm(false)}
        blanketModels={blanketModels.filter(model => 
          inventory.some(item => item.blanketModelId === model.id && item.quantity > 0)
        )}
        onSubmit={(orderData) => {
          // Handle order submission
          console.log(orderData);
          setOpenOrderForm(false);
        }}
      />
    </Box>
  );
};

export default Dashboard;