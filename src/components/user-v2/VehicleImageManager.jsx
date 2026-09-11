"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowDownward,
  ArrowUpward,
  Delete,
  PhotoCamera,
  Refresh,
  Star,
  StarBorder,
} from "@mui/icons-material";
import { FormattedMessage, useIntl } from "react-intl";
import ImageCropper from "@/utils/imageCropper";
import {
  createVehicleImagePreview,
  getAccessibleImageActions,
  getVehicleImageDisplayUrl,
  mapVehicleImageApiError,
  moveVehicleImage,
  normalizeVehicleImageOrder,
  prepareVehicleImageRetry,
  revokeVehicleImagePreview,
  validateVehicleImagesForReview,
} from "@/features/user-v2/vehicle-images.mjs";
import {
  useDeleteVehicleImage,
  useReorderVehicleImages,
  useSetVehiclePrimaryImage,
  useUploadVehicleImage,
  useVehicleImages,
} from "@/queries/vehicle-images";

export default function VehicleImageManager({ vehicleId }) {
  const intl = useIntl();
  const fileInputRef = useRef(null);
  const cropStateRef = useRef(null);
  const localUploadsRef = useRef([]);
  const imagesQuery = useVehicleImages(vehicleId);
  const uploadMutation = useUploadVehicleImage();
  const deleteMutation = useDeleteVehicleImage();
  const primaryMutation = useSetVehiclePrimaryImage();
  const reorderMutation = useReorderVehicleImages();
  const [cropState, setCropState] = useState(null);
  const [localUploads, setLocalUploads] = useState([]);
  const uploadCounterRef = useRef(0);
  const images = normalizeVehicleImageOrder(imagesQuery.data || []);
  const reviewValidation = validateVehicleImagesForReview(images);
  const totalCount = images.length + localUploads.filter((item) => item.status !== "FAILED").length;

  useEffect(() => {
    cropStateRef.current = cropState;
  }, [cropState]);

  useEffect(() => {
    localUploadsRef.current = localUploads;
  }, [localUploads]);

  useEffect(() => () => {
    if (cropStateRef.current?.preview) revokeVehicleImagePreview(cropStateRef.current.preview);
    localUploadsRef.current.forEach((upload) => {
      if (upload.preview?.isObjectUrl) revokeVehicleImagePreview(upload.preview);
    });
  }, []);

  const closeCropModal = () => {
    if (cropState?.preview) revokeVehicleImagePreview(cropState.preview);
    setCropState(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (totalCount >= 30) {
      setLocalUploads((current) => [
        ...current,
        buildFailedLocalUpload(file, "vehicle_images.validation.max"),
      ]);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setLocalUploads((current) => [
        ...current,
        buildFailedLocalUpload(file, "vehicle_images.error.invalid_type"),
      ]);
      return;
    }

    const preview = createVehicleImagePreview(file);
    setCropState({ file, preview });
  };

  const handleCropComplete = (croppedBase64) => {
    const file = base64ToFile(croppedBase64, cropState?.file?.name || "vehicle-image.jpg");
    closeCropModal();
    uploadFile(file, { preview: { url: croppedBase64, isObjectUrl: false } });
  };

  const uploadFile = (file, { preview, localId: providedLocalId } = {}) => {
    const localId = providedLocalId || `local-${++uploadCounterRef.current}`;
    const localUpload = {
      id: localId,
      file,
      fileName: file.name,
      preview,
      status: "UPLOADING",
      progress: 35,
      error: null,
    };

    setLocalUploads((current) => [
      ...current.filter((item) => item.id !== localId),
      localUpload,
    ]);

    uploadMutation.mutate({ vehicleId, file }, {
      onSuccess: () => {
        setLocalUploads((current) => current.filter((item) => item.id !== localId));
      },
      onError: (error) => {
        setLocalUploads((current) => current.map((item) => (
          item.id === localId
            ? { ...item, status: "FAILED", progress: 0, error: mapVehicleImageApiError(error) }
            : item
        )));
      },
    });
  };

  const retryUpload = (upload) => {
    const retryState = prepareVehicleImageRetry(upload);
    setLocalUploads((current) => current.map((item) => item.id === upload.id ? retryState : item));
    uploadFile(upload.file, { preview: upload.preview, localId: upload.id });
  };

  const handleMove = (imageId, delta) => {
    const moved = moveVehicleImage(images, imageId, delta);
    reorderMutation.mutate({ vehicleId, images: moved });
  };

  if (!imagesQuery.isContractAvailable) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <FormattedMessage id="vehicle_images.contract.unavailable" />
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6">
            <FormattedMessage id="vehicle_images.title" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id="vehicle_images.help" />
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<PhotoCamera />}
          onClick={() => fileInputRef.current?.click()}
          disabled={totalCount >= 30 || uploadMutation.isPending}
        >
          <FormattedMessage id="vehicle_images.upload" />
        </Button>
      </Stack>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      {imagesQuery.isMock && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <FormattedMessage id="vehicle_images.mock_note" />
        </Alert>
      )}

      {!reviewValidation.valid && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {reviewValidation.errors.map((errorId) => (
            <Box key={errorId}><FormattedMessage id={errorId} values={{ min: 5, max: 30 }} /></Box>
          ))}
        </Alert>
      )}

      {imagesQuery.isLoading && <CircularProgress />}

      <Grid container spacing={2}>
        {images.map((image, index) => (
          <Grid item xs={12} sm={6} md={4} key={image.id}>
            <ImageCard
              image={image}
              index={index}
              total={images.length}
              onMove={handleMove}
              onSetPrimary={() => primaryMutation.mutate({ vehicleId, imageId: image.id })}
              onDelete={() => deleteMutation.mutate({ vehicleId, imageId: image.id })}
              disabled={deleteMutation.isPending || primaryMutation.isPending || reorderMutation.isPending}
            />
          </Grid>
        ))}

        {localUploads.map((upload) => (
          <Grid item xs={12} sm={6} md={4} key={upload.id}>
            <LocalUploadCard
              upload={upload}
              onRetry={() => retryUpload(upload)}
              onRemove={() => setLocalUploads((current) => current.filter((item) => item.id !== upload.id))}
              intl={intl}
            />
          </Grid>
        ))}
      </Grid>

      {!images.length && !localUploads.length && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <FormattedMessage id="vehicle_images.empty" />
        </Alert>
      )}

      <Modal open={Boolean(cropState)} onClose={closeCropModal}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: { xs: "95%", sm: 520 }, bgcolor: "background.paper", boxShadow: 24, borderRadius: 2 }}>
          {cropState?.preview?.url && (
            <ImageCropper
              imageSrc={cropState.preview.url}
              onCropComplete={handleCropComplete}
              setCropModal={(open) => {
                if (!open) closeCropModal();
              }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}

function ImageCard({ image, index, total, onMove, onSetPrimary, onDelete, disabled }) {
  const actions = getAccessibleImageActions(image, index, total);
  const intl = useIntl();

  return (
    <Card>
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={getVehicleImageDisplayUrl(image)}
          alt={image.fileName || intl.formatMessage({ id: "vehicle_images.alt" }, { index: index + 1 })}
          sx={{ height: 180, objectFit: "cover" }}
        />
        {image.isPrimary && (
          <Box sx={{ position: "absolute", top: 8, left: 8, bgcolor: "primary.main", color: "white", px: 1, py: 0.5, borderRadius: 1 }}>
            <FormattedMessage id="vehicle_images.primary" />
          </Box>
        )}
        <Box sx={{ position: "absolute", bottom: 8, right: 8, bgcolor: "rgba(0,0,0,.65)", color: "white", px: 1, py: 0.5, borderRadius: 1 }}>
          #{index + 1}
        </Box>
      </Box>
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="body2" noWrap>{image.fileName || image.id}</Typography>
      </CardContent>
      <CardActions sx={{ flexWrap: "wrap" }}>
        <IconButton aria-label={intl.formatMessage({ id: actions.moveUp.labelId })} disabled={disabled || actions.moveUp.disabled} onClick={() => onMove(image.id, -1)}>
          <ArrowUpward />
        </IconButton>
        <IconButton aria-label={intl.formatMessage({ id: actions.moveDown.labelId })} disabled={disabled || actions.moveDown.disabled} onClick={() => onMove(image.id, 1)}>
          <ArrowDownward />
        </IconButton>
        <IconButton aria-label={intl.formatMessage({ id: actions.setPrimary.labelId })} disabled={disabled || actions.setPrimary.disabled} onClick={onSetPrimary} color={image.isPrimary ? "primary" : "default"}>
          {image.isPrimary ? <Star /> : <StarBorder />}
        </IconButton>
        <IconButton aria-label={intl.formatMessage({ id: actions.delete.labelId })} disabled={disabled} onClick={onDelete} color="error">
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
}

function LocalUploadCard({ upload, onRetry, onRemove, intl }) {
  return (
    <Card variant="outlined">
      <CardMedia
        component="img"
        image={upload.preview?.url}
        alt={upload.fileName}
        sx={{ height: 180, objectFit: "cover" }}
      />
      <CardContent>
        <Typography variant="body2" noWrap>{upload.fileName}</Typography>
        {upload.status === "UPLOADING" && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress variant="determinate" value={upload.progress || 35} />
            <Typography variant="caption"><FormattedMessage id="vehicle_images.uploading" /></Typography>
          </Box>
        )}
        {upload.status === "FAILED" && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {upload.error ? intl.formatMessage({ id: upload.error }) : <FormattedMessage id="vehicle_images.error.generic" />}
          </Alert>
        )}
      </CardContent>
      <CardActions>
        {upload.status === "FAILED" && (
          <Button size="small" startIcon={<Refresh />} onClick={onRetry}>
            <FormattedMessage id="vehicle_images.action.retry" />
          </Button>
        )}
        <Button size="small" color="error" onClick={onRemove}>
          <FormattedMessage id="vehicle_images.action.delete" />
        </Button>
      </CardActions>
    </Card>
  );
}

function buildFailedLocalUpload(file, error) {
  return {
    id: `failed-${Date.now()}`,
    file,
    fileName: file.name,
    preview: { url: "", isObjectUrl: false },
    status: "FAILED",
    progress: 0,
    error,
  };
}

function base64ToFile(base64String, fileName) {
  const mimeType = base64String.split(";")[0].split(":")[1] || "image/jpeg";
  const byteString = atob(base64String.split(",")[1]);
  const byteArray = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i += 1) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([byteArray], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
}
