import { Box, Button, TextField, Typography } from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import React from 'react';

const InventoryTable = ({ inventory, blanketModels, loading, onUpdate }) => {
  const [editValues, setEditValues] = React.useState({});

  const handleEditChange = (id, field, value) => {
    setEditValues(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleUpdate = (id) => {
    const updatedQuantity = editValues[id]?.quantity;
    if (updatedQuantity !== undefined && updatedQuantity !== null) {
      onUpdate(id, parseInt(updatedQuantity, 10));
      setEditValues(prev => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
    }
  };

  const columns = [
    { 
      field: 'blanketModelName', 
      headerName: 'Product', 
      width: 250,
      valueGetter: (params) => {
        const model = blanketModels.find(b => b.id === params.row.blanketModelId);
        return model ? model.name : 'Unknown';
      }
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      width: 150,
      renderCell: (params) => {
        const isEditing = editValues[params.row.blanketModelId] !== undefined;
        return isEditing ? (
          <TextField
            type="number"
            value={editValues[params.row.blanketModelId]?.quantity ?? params.row.quantity}
            onChange={(e) => handleEditChange(params.row.blanketModelId, 'quantity', e.target.value)}
            size="small"
            inputProps={{ min: 0 }}
          />
        ) : (
          params.row.quantity
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => {
        const isEditing = editValues[params.row.blanketModelId] !== undefined;
        return isEditing ? (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => handleUpdate(params.row.blanketModelId)}
          >
            Save
          </Button>
        ) : (
          <Button
            size="small"
            variant="outlined"
            onClick={() => setEditValues(prev => ({
              ...prev,
              [params.row.blanketModelId]: { quantity: params.row.quantity }
            }))}
          >
            Edit
          </Button>
        );
      }
    }
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={inventory}
        columns={columns}
        loading={loading}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        getRowId={(row) => row.blanketModelId}
        disableSelectionOnClick
      />
    </Box>
  );
};

export default InventoryTable;