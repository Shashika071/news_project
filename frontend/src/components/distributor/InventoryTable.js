import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';

const InventoryTable = ({ inventory, blanketModels, loading, onUpdate }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Blanket Model</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventory.map((item) => {
            const model = blanketModels.find(m => m.id === item.blanketModelId);
            return (
              <TableRow key={item.id}>
                <TableCell>{model?.name || 'Unknown'}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdate(item.blanketModelId, parseInt(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    onClick={() => onUpdate(item.blanketModelId, item.quantity)}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InventoryTable;