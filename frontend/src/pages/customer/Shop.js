import { Box, Button, Card, CardActions, CardContent, CardMedia, Grid, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { getBlanketModels } from '../../api/blanketService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Shop = () => {
  const [blanketModels, setBlanketModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchBlanketModels();
  }, []);

  const fetchBlanketModels = async () => {
    try {
      setLoading(true);
      const models = await getBlanketModels();
      setBlanketModels(models.filter(model => model.isActive));
    } catch (error) {
      toast.error('Failed to fetch blanket models');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = blanketModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (model) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    toast.success(`${model.name} added to cart`);
    // TODO: Implement cart functionality
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cozy Comfort Blankets
      </Typography>

      <TextField
        fullWidth
        label="Search blankets..."
        variant="outlined"
        sx={{ mb: 3 }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredModels.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No blankets found matching your search.</Typography>
            </Grid>
          ) : (
            filteredModels.map((model) => (
              <Grid item xs={12} sm={6} md={4} key={model.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={model.imageUrl || '/placeholder-blanket.jpg'}
                    alt={model.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {model.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {model.material} • {model.size}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      ${model.retailPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      {model.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleAddToCart(model)}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Shop;