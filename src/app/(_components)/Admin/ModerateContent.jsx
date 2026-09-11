import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Grid, Divider, Card, CardContent, CardMedia } from '@mui/material';
import { toast } from 'react-toastify';
import { useAddBannerMutation, useBanner, useDeleteBannerMutation } from '@/queries/lots';
import { useQueryClient } from "@tanstack/react-query";
import { Delete, Edit } from '@mui/icons-material';

export default function ModerateContent() {
  const [lotId, setLotId] = useState('');
  const [banner, setBanner] = useState(null);
  const [expiresDate, setExpiringDate] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: bannerData, refetch } = useBanner();
  const navigate = useNavigate();

  // Use the mutation hook
  const addBannerMutation = useAddBannerMutation(
    (data) => {
      toast.success("Banner added successfully!");
      setLotId('');
      setExpiringDate('');
      refetch();
      setBanner(null);
      setLoading(false);
    },
    (error) => {
      toast.error("Failed to add banner!");
      setLoading(false);
    }
  );

  const { mutate: deleteBanner, isLoading: isDeleting } = useDeleteBannerMutation(
    (data) => {
      if (data.status === "NOT_FOUND") {
        toast.info(data.message);
      } else {
        toast.success(data.message);
      }
    },
    () => toast.error("Failed to delete banner.")
  );

  // Handle the file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBanner(file);
    }
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!lotId || !banner || !expiresDate) {
      toast.error("Lot ID, banner image, and expiring date are required.");
      return;
    }

    setLoading(true);
    addBannerMutation.mutate({ lotId, banner, expiresDate });
  };

  return (
    <div className='space-y-5'>
      <h1 className="text-2xl font-semibold px-4">Promo banners</h1>
      <Divider />
      <div className="block">
        {bannerData?.map((banner, i) => (
          <Card key={i} className="shadow-lg hover:shadow-xl transition duration-300 flex my-2 h-[200px]">
            <div className="w-[50%]">
              <CardMedia
                component="img"
                height="200"
                image={banner.bannerUrl}
                alt={banner.title}
                sx={{ borderTopLeftRadius: 2, borderTopRightRadius: 2, width: 'auto', height: '100%' }}
              />
            </div>
            <div className="w-[50%] flex flex-col justify-center space-y-4">
              <Typography variant="h6" fontWeight="bold">
                {banner?.lotDto?.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Expires on: {banner?.expiresDate || "No expiration set"}
              </Typography>
              <div className="flex space-x-3">
                <Button size="small" color="primary" variant='contained'
                  onClick={() => navigate(`/lots/${banner?.lotDto?.id}`)}>
                  View lot
                </Button>
                <Button size="small" color="error" variant='outlined'
                  onClick={() => deleteBanner(banner?.lotDto?.id)}>
                  <Delete /> Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <h1 className="text-2xl font-semibold px-4">Create</h1>
      <Divider />
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Lot ID"
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              variant="outlined"
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Expiring Date"
              type="datetime-local"
              value={expiresDate}
              onChange={(e) => setExpiringDate(e.target.value)}
              variant="outlined"
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create banner'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}
