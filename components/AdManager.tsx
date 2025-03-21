import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { Ad, AdCategory } from '../types/ads';

/**
 * Admin component for managing ads
 */
export default function AdManager() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<AdCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentAd, setCurrentAd] = useState<Partial<Ad> | null>(null);

  // Fetch ads and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // This would typically be an admin API endpoint
        const adsResponse = await axios.get('/api/admin/ads');
        const categoriesResponse = await axios.get('/api/admin/categories');

        setAds(adsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err: any) {
        console.error('Error fetching ad data:', err);
        setError(err.message || 'Failed to load ad data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenDialog = (ad?: Ad) => {
    if (ad) {
      setCurrentAd({ ...ad });
    } else {
      setCurrentAd({
        id: '',
        title: '',
        description: '',
        targetUrl: '',
        categories: [],
        priority: 1,
        impressions: 0,
        clicks: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAd(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name && currentAd) {
      setCurrentAd({
        ...currentAd,
        [name]: value
      });
    }
  };

  const handleSave = async () => {
    if (!currentAd) return;

    try {
      if (currentAd.id) {
        // Update existing ad
        await axios.put(`/api/admin/ads/${currentAd.id}`, currentAd);
      } else {
        // Create new ad
        await axios.post('/api/admin/ads', currentAd);
      }

      // Refresh the ad list
      const response = await axios.get('/api/admin/ads');
      setAds(response.data);
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving ad:', err);
      // In a real app, would show an error message to the user
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" component="h1">
          Ad Management
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpenDialog()}
        >
          Create New Ad
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Categories</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Impressions</TableCell>
              <TableCell>Clicks</TableCell>
              <TableCell>CTR</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell>{ad.title}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {ad.categories.map((catId) => {
                      const category = categories.find(c => c.id === catId);
                      return (
                        <Chip
                          key={catId}
                          label={category?.name || catId}
                          size="small"
                        />
                      );
                    })}
                  </Stack>
                </TableCell>
                <TableCell>{ad.priority}</TableCell>
                <TableCell>{ad.impressions}</TableCell>
                <TableCell>{ad.clicks}</TableCell>
                <TableCell>
                  {ad.impressions > 0 
                    ? `${((ad.clicks / ad.impressions) * 100).toFixed(2)}%` 
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    onClick={() => handleOpenDialog(ad)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Ad Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentAd?.id ? 'Edit Ad' : 'Create New Ad'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="title"
              label="Title"
              fullWidth
              value={currentAd?.title || ''}
              onChange={handleChange}
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={currentAd?.description || ''}
              onChange={handleChange}
            />
            <TextField
              name="targetUrl"
              label="Target URL"
              fullWidth
              value={currentAd?.targetUrl || ''}
              onChange={handleChange}
            />
            <TextField
              name="imageUrl"
              label="Image URL"
              fullWidth
              value={currentAd?.imageUrl || ''}
              onChange={handleChange}
            />
            <FormControl fullWidth>
              <InputLabel>Categories</InputLabel>
              <Select
                multiple
                name="categories"
                value={currentAd?.categories || []}
                onChange={handleChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => {
                      const category = categories.find(c => c.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={category?.name || value} 
                          size="small" 
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="priority"
              label="Priority"
              type="number"
              fullWidth
              value={currentAd?.priority || 1}
              onChange={handleChange}
              inputProps={{ min: 1, max: 10 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 