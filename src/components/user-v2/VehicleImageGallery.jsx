"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Close } from "@mui/icons-material";
import { FormattedMessage, useIntl } from "react-intl";
import {
  getVehicleImageDisplayUrl,
  normalizeVehicleImageOrder,
} from "@/features/user-v2/vehicle-images.mjs";
import { useVehicleImages } from "@/queries/vehicle-images";

export default function VehicleImageGallery({ vehicleId }) {
  const intl = useIntl();
  const imagesQuery = useVehicleImages(vehicleId);
  const images = normalizeVehicleImageOrder(imagesQuery.data || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const next = useCallback(() => {
    setSelectedIndex((current) => images.length ? (current + 1) % images.length : 0);
  }, [images.length]);

  const prev = useCallback(() => {
    setSelectedIndex((current) => images.length ? (current > 0 ? current - 1 : images.length - 1) : 0);
  }, [images.length]);

  useEffect(() => {
    if (!fullscreen) return;

    const handleKey = (event) => {
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "Escape") setFullscreen(false);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreen, next, prev]);

  if (!imagesQuery.isContractAvailable) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <FormattedMessage id="vehicle_images.contract.unavailable" />
      </Alert>
    );
  }

  if (imagesQuery.isLoading) return <CircularProgress />;

  if (!images.length) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <FormattedMessage id="vehicle_images.empty" />
      </Alert>
    );
  }

  const selected = images[selectedIndex] || images[0];

  return (
    <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        <FormattedMessage id="vehicle_images.gallery" />
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Box sx={{ position: "relative" }}>
            <CardMedia
              component="img"
              image={getVehicleImageDisplayUrl(selected)}
              alt={selected?.fileName || intl.formatMessage({ id: "vehicle_images.alt" }, { index: selectedIndex + 1 })}
              sx={{ height: { xs: 260, md: 420 }, objectFit: "cover", borderRadius: 2, cursor: "pointer" }}
              onClick={() => setFullscreen(true)}
            />
            {selected?.isPrimary && (
              <Box sx={{ position: "absolute", left: 12, top: 12, bgcolor: "primary.main", color: "white", px: 1, py: 0.5, borderRadius: 1 }}>
                <FormattedMessage id="vehicle_images.primary" />
              </Box>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={1}>
            {images.map((image, index) => (
              <Grid item xs={4} key={image.id}>
                <CardMedia
                  component="img"
                  image={getVehicleImageDisplayUrl(image)}
                  alt={image.fileName || intl.formatMessage({ id: "vehicle_images.alt" }, { index: index + 1 })}
                  onClick={() => setSelectedIndex(index)}
                  sx={{
                    height: 90,
                    objectFit: "cover",
                    borderRadius: 1,
                    cursor: "pointer",
                    border: selectedIndex === index ? "3px solid #1976d2" : "1px solid #ddd",
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} maxWidth="lg" fullWidth>
        <DialogContent sx={{ position: "relative", bgcolor: "black", p: 0 }}>
          <IconButton
            aria-label="close"
            onClick={() => setFullscreen(false)}
            sx={{ position: "absolute", top: 8, right: 8, color: "white", zIndex: 2 }}
          >
            <Close />
          </IconButton>
          <IconButton
            aria-label="previous image"
            onClick={prev}
            sx={{ position: "absolute", top: "50%", left: 8, color: "white", zIndex: 2 }}
          >
            <ArrowBackIos />
          </IconButton>
          <CardMedia
            component="img"
            image={getVehicleImageDisplayUrl(selected)}
            alt={selected?.fileName || intl.formatMessage({ id: "vehicle_images.alt" }, { index: selectedIndex + 1 })}
            sx={{ maxHeight: "85vh", objectFit: "contain" }}
          />
          <IconButton
            aria-label="next image"
            onClick={next}
            sx={{ position: "absolute", top: "50%", right: 8, color: "white", zIndex: 2 }}
          >
            <ArrowForwardIos />
          </IconButton>
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
