import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@mui/material";
import { getCroppedImg } from "./getCroppedImg";

const ImageCropper = ({ imageSrc, onCropComplete, setCropModal }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(croppedBlob);
      reader.onloadend = () => {
        onCropComplete(reader.result); // Send base64 string to parent
      };
    }
  };


  return (
    <div className="">

      <div style={{ position: "relative", width: "100%", height: 400 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={5 / 3} // Set aspect ratio (change if needed)
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteHandler}
        />
      </div>
      <div className="flex justify-center items-center py-2 gap-2">

        <Button
          variant="outlined"
          color="primary"
          onClick={() => setCropModal(false)}
          sx={{ mt: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirmCrop}
          sx={{ mt: 2 }}
        >
          Crop
        </Button>
      </div>
    </div>
  );
};

export default ImageCropper;
