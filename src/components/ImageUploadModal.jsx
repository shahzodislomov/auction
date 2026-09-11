"use client"
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Modal,
  Typography,
} from "@mui/material";
import { AddPhotoAlternate, Delete } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../api/api";
import ImageCropper from "../utils/imageCropper";
import { useAllLots, useAllLotsBySellerId, useLot, useLotImages } from "../queries/lots";
import { FormattedMessage, useIntl } from "react-intl";

const ImageUploadModal = ({ lotId, open, onClose, userId }) => {
  const [selectedImages, setSelectedImages] = useState([]);  // Array of files
  const [prevwImg, setPrevwImg] = useState([]);              // Array of preview URLs
  const [imageSrc, setImageSrc] = useState(null);            // Image source for cropping
  const [cropModal, setCropModal] = useState(false);       // Control crop modal

  const { refetch: refetchSellerId } = useAllLotsBySellerId(userId, 0, 20);
  const { refetch: refetchAll } = useAllLots();
  const { refetch: refetchLot } = useLot(lotId);
  const { refetch: refetchLotImg } = useLotImages(lotId);
  const intl = useIntl();

  const queryClient = useQueryClient();

  // Mutation for uploading images
  const { mutate: uploadImages, isLoading } = useMutation(
    async (images) => {
      const promises = images.map((image) => {
        const formData = new FormData();
        formData.append("lotId", lotId);
        formData.append("image", image);
        return api.post("/lot-image/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      });
      return Promise.all(promises);
    },
    {
      onSuccess: (responses) => {
        toast.success("Images uploaded successfully!");
        refetchAll();
        refetchLot();
        refetchLotImg();
        refetchSellerId();
        setSelectedImages([]);
        setPrevwImg([]);
        onClose(responses.map(res => res.data));  // Pass new images to parent
      },
      onError: (error) => {
        toast.error("Failed to upload images.");
        console.error(error);
      },
    }
  );

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setCropModal(true);
    } else {
      toast.error("Please select a valid image file.");
    }
  };

  // Handle cropping complete
  const handleCropComplete = (croppedBase64) => {
    const mimeType = croppedBase64.split(";")[0].split(":")[1];
    const byteString = atob(croppedBase64.split(",")[1]);
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: mimeType });
    const file = new File([blob], `croppedImage_${Date.now()}.jpg`, { type: mimeType });

    // Add file and preview to the arrays
    setSelectedImages((prev) => [...prev, file]);
    setPrevwImg((prev) => [...prev, croppedBase64]);

    setCropModal(false);
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      prevwImg.forEach(url => URL.revokeObjectURL(url));
    };
  }, [prevwImg]);

  // Remove selected image
  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPrevwImg((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle upload trigger
  const handleUpload = () => {
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image to upload.");
      return;
    }
    uploadImages(selectedImages);
  };

  return (
    <Modal open={open} onClose={() => onClose([])}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 3,
          width: { xs: "90%", md: "60%" },
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          <FormattedMessage id="uploadimg" />
        </Typography>

        {/* Upload Button */}
        <Button variant="outlined" component="label" startIcon={<AddPhotoAlternate />} sx={{ mt: 2 }}>
          <FormattedMessage id="selectimg" />
          <input type="file" hidden onChange={handleFileChange} accept="image/*" />
        </Button>

        {/* Preview Images */}
        {prevwImg.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
            {prevwImg.map((imgSrc, index) => (
              <Box key={index} sx={{ position: "relative", width: 150 }}>
                <img
                  src={imgSrc}
                  alt={`preview-${index}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "5px" }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemoveImage(index)}
                  sx={{ position: "absolute", top: 0, right: 0, minWidth: "30px" }}
                >
                  <Delete fontSize="small" />
                </Button>
              </Box>
            ))}
          </Box>
        )}

        {/* Crop Modal */}
        <Modal open={cropModal} onClose={() => setCropModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              borderRadius: 2,
            }}
          >
            <ImageCropper imageSrc={imageSrc} onCropComplete={handleCropComplete} />
          </Box>
        </Modal>

        {/* Action Buttons */}
        <Box mt={2} display="flex" justifyContent="end" gap={2}>
          <Button variant="outlined" onClick={() => onClose([])}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={isLoading}
          >
            {isLoading ? `${intl.formatMessage({ id: 'upload' })}...` : intl.formatMessage({ id: 'upload' })}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImageUploadModal;
