import { getStorageItem } from "@/utils/storage";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  FormHelperText,
  Modal,
  IconButton,
  Grid,
  InputAdornment,
  styled
} from "@mui/material";
import { useAllLots, useAllLotsBySellerId, useCreateLotMutation } from "@/queries/lots";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { useQueryClient } from "@tanstack/react-query";
import { useLotTypes } from "@/queries/lot-types";
import { AddPhotoAlternate, Delete, Percent } from "@mui/icons-material";
import { FormattedMessage, useIntl } from "react-intl";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import ImageCropper from "@/utils/imageCropper";
import useGovData from "@/queries/region";
import { useUserContext } from "@/context/UserContext";
import AttributeModal from "./AttributeModal";

function Createlot() {
  const [formData, setFormData] = useState({
    title: "",
    incrementValue: "",
    startPrice: "",
    startTime: dayjs(),
    lotTypeId: "",
    description: "",
    incrementType: "FIXED",
    images: [],
    attributes: {},
    regionId: "",
    districtId: "",
  });

  const intl = useIntl();
  const [startTimeError, setStartTimeError] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [cropModal, setCropModal] = useState(false);
  const [prevwImg, setPrevwImg] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const token = getStorageItem("token");
  const sellerId = getStorageItem("userId");
  const { user } = useUserContext();
  const [lotAttributes, setLotAttributes] = useState({});
  const [lotTypeAttributes, setLotTypeAttributes] = useState([]);
  const [lotTypeSubs, setLotTypeSubs] = useState([]);
  const { data: lotTypeData, isLoading: isLotTypesLoading } = useLotTypes(0, 20);
  const router = useRouter();
  const queryClient = useQueryClient();
  // const user = userResponse?.data || "";
  const mutation = useCreateLotMutation();
  const { refetch: refetchSellerId } = useAllLotsBySellerId(sellerId, 0, 20);
  const { refetch: refetchAll } = useAllLots();
  const { regions, districts, fetchDistricts, loading, error } = useGovData();
  const [selectedRegion, setSelectedRegion] = useState("");
  const [locationFetched, setLocationFetched] = useState(false);
  const [attrModal, setAttrModal] = useState(false)

  const handleRegionChange = (e) => {
    const regionId = e.target.value;
    setSelectedRegion(regionId);
    fetchDistricts(regionId); // Fetch districts for the selected region
    setFormData((prev) => ({ ...prev, regionId }));
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setFormData((prev) => ({ ...prev, districtId }));
  };
  const { mutate: createLot, isLoading: isCreating } = useCreateLotMutation(
    (data) => {
      if (data.status === "BAD_REQUEST") {
        toast.error(data.message);
      } else if (data.status === "CREATED") {
        // toast.success("Lot created successfully!");
        // navigate("/dashboard/my-lots");
        setAttrModal(true);
        refetchSellerId();
        refetchAll();
      }
    },
    (error) => {
      toast.error("Failed to create lot.");
      console.error("Error:", error);
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAttributeChange = (e) => {
    const { name, value } = e.target;
    setLotAttributes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Allow adding images only if the count is less than 10
    if (formData.images.length >= 10) {
      toast.error("You can only upload up to 10 images.");
      return;
    }

    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setCropModal(true);
    } else {
      toast.error('Please upload a valid image file.');
    }
  };

  const handleCropComplete = (croppedImg) => {
    const base64String = croppedImg;
    const mimeType = base64String.split(";")[0].split(":")[1];
    const byteString = atob(base64String.split(",")[1]);
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: mimeType });
    const file = new File([blob], "croppedImage.jpg", { type: mimeType });

    // Ensure the image count is between 4 and 10
    if (formData.images.length < 10) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), file],
      }));

      setPrevwImg((prevImages) => [
        ...(Array.isArray(prevImages) ? prevImages : []),
        base64String,
      ]);
    }

    setCropModal(false);
  };

  const handleDeleteImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    setPrevwImg((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!locationFetched && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        // Mock coordinates for testing       
        const { latitude, longitude } = position.coords;

        // const latitude = 41.47728733131971;
        // const longitude = 69.63320693086179;

        try {
          // Fetch address from OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=uz`
          );
          const data = await response.json();
          const city = data.address.city || data.address.state; // Toshkent viloyati
          const district = data.address.county || data.address.town; // Bo'stonliq Tumani

          // Normalize text function
          const normalizeText = (text) => text.replace(/[‘’`]/g, "'").toLowerCase();

          // Find region from your API
          const region = regions.find((reg) => normalizeText(reg.nameUz) === normalizeText(city));
          if (region) {
            setSelectedRegion(region.id);
            setFormData((prev) => ({ ...prev, regionId: region.id }));
            fetchDistricts(region.id);
          }

          // Find district from your API
          const districtData = districts.find((dist) => normalizeText(dist.nameUz) === normalizeText(district));
          if (districtData) {
            setFormData((prev) => ({ ...prev, districtId: districtData.id }));
            setLocationFetched(true)
          }
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [regions, districts, locationFetched]);

  useEffect(() => {
    setIsFormValid(
      formData.title &&
      formData.incrementValue &&
      formData.startPrice &&
      formData.startTime &&
      !startTimeError &&
      formData.lotTypeId &&
      formData.images.length >= 4 && formData.images.length <= 10
    );
  }, [formData, startTimeError]);

  useEffect(() => {
    const selectedLotType = lotTypeData?.find(
      (lotType) => lotType.id === formData.lotTypeId
    );

    if (selectedLotType) {
      setLotTypeAttributes(selectedLotType.attributes || []);
      setLotTypeSubs(selectedLotType.subCategories || []);
    } else {
      setLotTypeAttributes([]);
      setLotTypeSubs([]);
    }
  }, [formData.lotTypeId, lotTypeData]);


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.lotTypeId) {
      toast.error("Please select a Lot Type.");
      return;
    }

    // Transform attributes into API format
    const formattedAttributes = Object.fromEntries(
      Object.entries(lotAttributes).map(([key, value]) => [`${key}`, value])
    );

    const dataToSubmit = {
      ...formData,
      sellerId,
      startTime: formData.startTime.format("YYYY-MM-DDTHH:mm:ss"),
      attributes: JSON.stringify(formattedAttributes), // Convert attributes to string
      subCategory: JSON.stringify(formData.subCategory), // Convert attributes to string
    };

    // console.log(dataToSubmit);

    createLot(dataToSubmit);
  };



  // console.log(prevwImg);


  useEffect(() => {
    return () => {
      formData.images.forEach(file => {
        URL.revokeObjectURL(file);
      });
    };
  }, [formData.images]);

  // console.log(formData.images);

  // const handleCropComplete = (croppedImg) => {
  //   // Convert the Blob (cropped image) to a File object
  //   const file = new File([croppedImg], "croppedImage.jpg", {
  //     type: croppedImg.type,
  //   });

  //   // Update the formData with the File object
  //   setFormData((prev) => ({
  //     ...prev,
  //     images: [...(prev.images || []), file], // Use the File object here
  //   }));

  //   setCropModal(false); // Close the modal after cropping
  // };

  const handleDateTimeChange = (newValue) => {
    const parsedValue = newValue ? dayjs(newValue) : null;

    if (!parsedValue) {
      setStartTimeError("Invalid date/time");
    } else {
      setStartTimeError(""); // Clear error if valid
    }

    setFormData((prev) => ({
      ...prev,
      startTime: parsedValue,
    }));
  };

  if (isLotTypesLoading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-xl text-center mt-20 font-bold">
          <FormattedMessage id='loginRequired' defaultMessage="Hisobga kiring" />
        </h1>
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mx: "auto", px: 2, width: '70%', }}>
        <Typography variant="h4">
          <FormattedMessage id='dashboard.createLot' />
        </Typography>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">  
            <TextField
              label={intl.formatMessage({ id: 'name' })}
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label={intl.formatMessage({ id: 'startprice' })}
              name="startPrice"
              type="text"
              value={formData.startPrice}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                value = value.replace(/\B(?=(\d{3})+(?!\d))/g, " "); // Add spaces for thousand separators
                handleChange({ target: { name: "startPrice", value } }); // Ensure it updates formData properly
              }}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" className="select-none">
                    UZS
                  </InputAdornment>
                ),
              }}
            />
          </div>



          <div className="flex gap-2">
            <FormControl fullWidth margin="normal">
              <InputLabel id="increment-type-label"><FormattedMessage id='inctype' /></InputLabel>
              <Select
                labelId="increment-type-label"
                label="Increment Type"
                id="increment-type"
                name="incrementType"
                value={formData.incrementType}
                onChange={handleChange}
              >
                <MenuItem value="FIXED"><FormattedMessage id='fixed' /></MenuItem>
                <MenuItem value="PERCENTAGE"><FormattedMessage id='percentage' /></MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={intl.formatMessage({ id: 'incrementvalue' })}
              name="incrementValue"
              type="text" // Changed to "text" to allow formatting
              inputProps={{
                min: formData.incrementType === "PERCENTAGE" ? 0 : undefined,
                max: formData.incrementType === "PERCENTAGE" ? 100 : undefined,
                step: formData.incrementType === "PERCENTAGE" ? 0.01 : 1,
              }}
              value={
                formData.incrementType === "PERCENTAGE"
                  ? formData.incrementValue // No thousand separator for percentage
                  : formData.incrementValue?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") // Adds space as thousand separator
              }
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                if (formData.incrementType !== "PERCENTAGE") {
                  value = value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                }
                handleChange({ target: { name: "incrementValue", value } });
              }}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" className="select-none">
                    {formData.incrementType === "PERCENTAGE" ? (
                      <Percent />
                    ) : (
                      "UZS"
                    )}
                  </InputAdornment>
                ),
              }}
            />

          </div>

          <div className="flex gap-2">
            <DateTimePicker
              label={intl.formatMessage({ id: 'starttime' })}
              value={formData.startTime}
              onChange={handleDateTimeChange}
              minDateTime={dayjs()}
              ampm={false}
              format="DD.MM.YYYY HH:mm"
              sx={{ width: "100%", mt: 2 }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="lot-type-label"><FormattedMessage id='lottype' /></InputLabel>
              <Select
                label={intl.formatMessage({ id: 'lottype' })}
                labelId="lot-type-label"
                name="lotTypeId"
                value={formData.lotTypeId}
                onChange={handleChange}
              >
                {lotTypeData?.map((lotType, i) => {
                  const lotTypeName = lotType.name;
                  const lotTypeLocalized = lotTypeName[intl.locale];

                  return (
                    <MenuItem value={lotType.id} key={i}>
                      {lotTypeLocalized}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </div>

          <TextField
            label={intl.formatMessage({ id: 'description' })}
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
            margin="normal"
          />
          <div className="flex gap-2">
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="lot-type-label"><FormattedMessage id='region' /></InputLabel>
              <Select
                label={intl.formatMessage({ id: 'region' })}
                labelId="lot-type-label"
                name="regionId"
                value={selectedRegion}
                onChange={handleRegionChange}
              >
                {regions?.map((reg, i) => {
                  return (
                    <MenuItem value={reg.id} key={i}>
                      {reg.nameUz}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="lot-type-label"><FormattedMessage id='district' /></InputLabel>
              <Select
                label={intl.formatMessage({ id: 'district' })}
                labelId="lot-type-label"
                name="districtId"
                value={formData.districtId}
                onChange={handleDistrictChange}
              >
                {districts?.map((dist, i) => {
                  return (
                    <MenuItem value={dist.id} key={i}>
                      {dist.nameUz}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </div>

          <Button variant="outlined" component="label" startIcon={<AddPhotoAlternate />} fullWidth sx={{ mt: 2 }}>
            <FormattedMessage id='uploadimg' />
            <input type="file" hidden onChange={handleFileChange} accept="image/*" />
          </Button>

          {/* Preview Images */}
          {Array.isArray(prevwImg) && prevwImg.length > 0 && (
            <div className="block">
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2, }}>
                {prevwImg.slice(0, 10).map((croppedImg, index) => (
                  <div className="relative border rounded-sm">
                    <Box key={index} sx={{ width: { xs: 100, md: 200 }, overflow: "hidden" }}>
                      <img
                        src={croppedImg}
                        alt={`preview-${index}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                    <IconButton
                      onClick={() => handleDeleteImage(index)}
                      sx={{ position: "absolute", top: 0, right: 0, p: 0, m: 0 }}
                    >
                      <Delete color="error" />
                    </IconButton>
                  </div>
                ))}
              </Box>
              <div className="mt-2 text-[14px] text-red-500">* Kamida 4 ta rasm yuklanishi lozim!</div>
            </div>
          )}

          {/* Crop Modal */}
          <Modal open={cropModal} onClose={() => setCropModal(false)} sx={{ borderRadius: '20px' }}>
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, bgcolor: "background.paper", boxShadow: 24, borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
              <ImageCropper imageSrc={imageSrc} onCropComplete={handleCropComplete} setCropModal={setCropModal} />
            </Box>
          </Modal>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ my: 3 }} disabled={!isFormValid || isCreating}>
            <FormattedMessage id='continue' />{isCreating ? "..." : ""}
          </Button>
        </form>
      </Box>
      <AttributeModal open={attrModal} setOpen={setAttrModal} />
    </LocalizationProvider >
  );
}

export default Createlot;
