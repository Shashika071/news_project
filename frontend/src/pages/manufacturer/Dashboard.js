import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { createBlanketModel, deleteBlanketModel, getBlanketModels, updateBlanketModel } from '../../api/blanketService';
import { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import BlanketModelForm from '../../components/manufacturer/BlanketModelForm';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [blanketModels, setBlanketModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    fetchBlanketModels();
  }, []);

  const fetchBlanketModels = async () => {
    try {
      setLoading(true);
      const models = await getBlanketModels();
      setBlanketModels(models);
    } catch (error) {
      toast.error('Failed to fetch blanket models');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = () => {
    setSelectedModel(null);
    setOpenForm(true);
  };

  const handleEditModel = (model) => {
    setSelectedModel(model);
    setOpenForm(true);
  };

  const handleSubmitModel = async (modelData) => {
    try {
      if (selectedModel) {
        await updateBlanketModel(selectedModel.id, modelData);
        toast.success('Blanket model updated successfully');
      } else {
        await createBlanketModel(modelData);
        toast.success('Blanket model created successfully');
      }
      fetchBlanketModels();
      setOpenForm(false);
    } catch (error) {
      toast.error('Failed to save blanket model');
      console.error(error);
    }
  };

  const handleDeleteModel = async (id) => {
    try {
      await deleteBlanketModel(id);
      toast.success('Blanket model deleted successfully');
      fetchBlanketModels();
    } catch (error) {
      toast.error('Failed to delete blanket model');
      console.error(error);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'material', headerName: 'Material', width: 150 },
    { field: 'size', headerName: 'Size', width: 100 },
    { field: 'manufacturerPrice', headerName: 'Price', width: 100, type: 'number' },
    { field: 'retailPrice', headerName: 'Retail Price', width: 100, type: 'number' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button 
            size="small" 
            onClick={() => handleEditModel(params.row)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            onClick={() => handleDeleteModel(params.row.id)}
            variant="outlined"
            color="error"
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manufacturer Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {user?.businessName || user?.username}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Blanket Models</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleAddModel}
              >
                Add Model
              </Button>
            </Box>
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={blanketModels}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                loading={loading}
                disableSelectionOnClick
              />
            </div>
          </Paper>
        </Grid>
      </Grid>

      <BlanketModelForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmitModel}
        initialValues={selectedModel || {
          name: '',
          description: '',
          material: '',
          size: '',
          weight: 0,
          manufacturerPrice: 0,
          retailPrice: 0,
          imageUrl: '',
          isActive: true
        }}
      />
    </Box>
  );
};

export default Dashboard;