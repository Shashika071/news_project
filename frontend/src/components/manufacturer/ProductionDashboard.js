import { Box, Button, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getProductionCapacities, updateProductionCapacity } from '../../api/orderService';

import { DataGrid } from '@mui/x-data-grid';

const ProductionDashboard = () => {
  const [capacities, setCapacities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    fetchCapacities();
  }, []);

  const fetchCapacities = async () => {
    try {
      setLoading(true);
      const data = await getProductionCapacities();
      setCapacities(data);
    } catch (error) {
      console.error('Failed to fetch production capacities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (blanketModelId, field, value) => {
    setEditValues(prev => ({
      ...prev,
      [blanketModelId]: {
        ...prev[blanketModelId],
        [field]: value
      }
    }));
  };

  const handleUpdate = async (blanketModelId) => {
    try {
      const capacityData = {
        dailyCapacity: parseInt(editValues[blanketModelId]?.dailyCapacity, 10),
        currentProductionQueue: parseInt(editValues[blanketModelId]?.currentProductionQueue, 10)
      };
      
      await updateProductionCapacity(blanketModelId, capacityData);
      
      setEditValues(prev => {
        const newValues = { ...prev };
        delete newValues[blanketModelId];
        return newValues;
      });
      
      fetchCapacities();
    } catch (error) {
      console.error('Failed to update production capacity:', error);
    }
  };

  const columns = [
    { field: 'blanketModelName', headerName: 'Product', width: 250 },
    { 
      field: 'dailyCapacity', 
      headerName: 'Daily Capacity', 
      width: 150,
      renderCell: (params) => {
        const isEditing = editValues[params.row.blanketModelId] !== undefined;
        return isEditing ? (
          <TextField
            type="number"
            value={editValues[params.row.blanketModelId]?.dailyCapacity ?? params.row.dailyCapacity}
            onChange={(e) => handleEditChange(params.row.blanketModelId, 'dailyCapacity', e.target.value)}
            size="small"
            inputProps={{ min: 0 }}
          />
        ) : (
          params.row.dailyCapacity
        );
      }
    },
    { 
      field: 'currentProductionQueue', 
      headerName: 'Production Queue', 
      width: 150,
      renderCell: (params) => {
        const isEditing = editValues[params.row.blanketModelId] !== undefined;
        return isEditing ? (
          <TextField
            type="number"
            value={editValues[params.row.blanketModelId]?.currentProductionQueue ?? params.row.currentProductionQueue}
            onChange={(e) => handleEditChange(params.row.blanketModelId, 'currentProductionQueue', e.target.value)}
            size="small"
            inputProps={{ min: 0 }}
          />
        ) : (
          params.row.currentProductionQueue
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => {
        const isEditing = editValues[params.row.blanketModelId] !== undefined;
        return isEditing ? (
          <>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => handleUpdate(params.row.blanketModelId)}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => {
                setEditValues(prev => {
                  const newValues = { ...prev };
                  delete newValues[params.row.blanketModelId];
                  return newValues;
                });
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            size="small"
            variant="outlined"
            onClick={() => setEditValues(prev => ({
              ...prev,
              [params.row.blanketModelId]: { 
                dailyCapacity: params.row.dailyCapacity,
                currentProductionQueue: params.row.currentProductionQueue
              }
            }))}
          >
            Edit
          </Button>
        );
      }
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Production Management
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
        Manage production capacities and current queue for each blanket model
      </Typography>
      
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={capacities}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          getRowId={(row) => row.blanketModelId}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default ProductionDashboard;