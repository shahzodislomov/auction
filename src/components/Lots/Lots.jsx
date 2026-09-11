import React from 'react';
import { Box, Button, Card, CardContent, CardMedia, Chip, Divider, Grid, Typography, Tooltip } from "@mui/material";
import { Link } from 'next/link';
import { AccessTime, AttachMoney } from '@mui/icons-material';
import LotCard from './LotCard';

export default function Lots({ lots }) {
  return (
    <Box mt={4} px={2}>
      <Grid container spacing={3}>
        {lots?.map((lot) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={lot.id}>
            <LotCard lot={lot}/>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
