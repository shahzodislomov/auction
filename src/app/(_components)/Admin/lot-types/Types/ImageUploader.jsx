import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ImageUploader({ onImageUpload, initialImage }) {
  const [image, setImage] = useState(initialImage || null);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   setImage(initialImage);
  // }, [initialImage]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setLoading(true);
      setTimeout(() => {
        setImage(URL.createObjectURL(file));
        onImageUpload(file); // Pass file to parent component
        setLoading(false);
      }, 1500); // Simulating upload delay
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  });

  return (
    <Box sx={{ p: 1, textAlign: "center", border: "2px dashed #aaa", borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Upload Image
      </Typography>
      <div className="flex items-center">
        <div {...getRootProps()} style={{ cursor: "pointer", width: image ? '70%' : '100%' }}>
          <input {...getInputProps()} />
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <CloudUploadIcon sx={{ fontSize: 50, color: "gray" }} />
            <Typography variant="body2" color="textSecondary">
              Drag & drop an image here, or click to select
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>Choose File</Button>
          </Box>
        </div>
        <>
          {loading ? (
            <Skeleton height={100} width={100} style={{ borderRadius: 10, mt: 2 }} />
          ) : image ? (
            <Box sx={{ position: "relative" }}>
              <img src={image} alt="Uploaded preview" onClick={() => setImage(null)} style={{ height: 100, borderRadius: 10 }} />
              {/* <DeleteIcon onClick={() => setImage(null)} className="cursor-pointer" color="error"/> */}
            </Box>
          ) : null}
        </>
      </div>
    </Box>
  );
}
