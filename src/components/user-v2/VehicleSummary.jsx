"use client";

import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";

export default function VehicleSummary({ vehicle }) {
  if (!vehicle) return null;

  const rows = [
    ["vehicle.make", vehicle.makeName || vehicle.makeId],
    ["vehicle.model", vehicle.modelName || vehicle.modelId],
    ["vehicle.year", vehicle.year],
    ["vehicle.vin", vehicle.vin],
    ["vehicle.mileage", vehicle.mileage],
    ["vehicle.engine_volume", vehicle.engineVolume],
    ["vehicle.fuel_type", vehicle.fuelType],
    ["vehicle.transmission", vehicle.transmission],
    ["vehicle.drivetrain", vehicle.drivetrain],
    ["vehicle.body_type", vehicle.bodyType],
    ["vehicle.color", vehicle.color],
    ["vehicle.condition", vehicle.condition],
    ["vehicle.region", vehicle.regionName || vehicle.regionId],
    ["vehicle.city", vehicle.cityName || vehicle.cityId],
  ];

  return (
    <Paper elevation={1} sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">
          <FormattedMessage id="vehicle.detail_title" />
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {rows.map(([labelId, value]) => (
          <Grid item xs={12} sm={6} md={4} key={labelId}>
            <Typography variant="caption" color="text.secondary" display="block">
              <FormattedMessage id={labelId} />
            </Typography>
            <Typography variant="body1">{value || "—"}</Typography>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary" display="block">
            <FormattedMessage id="vehicle.description" />
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {vehicle.description || "—"}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
