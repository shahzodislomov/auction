"use client"
import { getStorageItem } from "@/utils/storage";
import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Typography,
    Grid,
} from "@mui/material";
import { useAllLots, useAllLotsBySellerId, useLot, useLotImages, useUpdateLotMutation } from "../queries/lots";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../api/api";
import { AddPhotoAlternate, Delete } from "@mui/icons-material";
import ImageUploadModal from "./ImageUploadModal";
import { useLotTypes } from "../queries/lot-types";
import { FormattedMessage, useIntl } from "react-intl";
import useGovData from "../queries/region";
import dayjs from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";


const EditLotForm = ({ lot, onClose }) => {
    const userId = parseInt(getStorageItem('userId'))
    const [formData, setFormData] = useState({
        id: lot.id,
        lotTypeId: lot.lotType.id || "", // Ensure it has a valid default
        subcategories: lot.subcategories || "",
        sellerId: lot.sellerId || "",
        title: lot.title || "",
        incrementValue: lot.incrementValue || "",
        startPrice: lot.startPrice || "",
        startTime: lot.startTime || "",
        regionId: lot.region.id || "",
        districtId: lot.district.id || "",
        description: lot.description || "",
        attributes: lot.attributes || "",
        incrementType: lot.incrementType || "",
    });
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const [lotTypeAttributes, setLotTypeAttributes] = useState([]);
    const [lotTypeSubs, setLotTypeSubs] = useState([]);
    const { locale } = useIntl();
    const { refetch: refetchSellerId } = useAllLotsBySellerId(userId, 0, 20);
    const { refetch: refetchAll } = useAllLots();
    const { refetch: refetchLot } = useLot(lot.id);
    const { data: lotImages, refetch: refetchLotImg } = useLotImages(lot.id);
    const intl = useIntl();
    const { data: lotTypes, isLoading: isLotTypesLoading } = useLotTypes(0, 20);
    const { regions, districts, fetchDistricts, loading, error } = useGovData();
    const [selectedRegion, setSelectedRegion] = useState(formData.regionId);

    const handleRegionChange = (e) => {
        const regionId = e.target.value;
        setSelectedRegion(regionId);
        fetchDistricts(regionId);
        setFormData((prev) => ({ ...prev, regionId, districtId: "" }));
    };

    const handleDistrictChange = (e) => {
        const districtId = e.target.value;
        setFormData((prev) => ({ ...prev, districtId }));
    };

    const handleAttributeChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            attributes: { ...prev.attributes, [name]: value }, // Update attributes
        }));
    };


    const { mutate: updateLot, isLoading: isUpdating } = useUpdateLotMutation(
        () => {
            toast.success("Lot updated successfully!");
            refetchSellerId();
            refetchAll();
            onClose();
        },
        (error) => {
            toast.error("Failed to update lot.");
            console.error(error);
        }
    );

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            id: lot.id,
            lotTypeId: lot.lotType?.id || "",
            subcategories: lot.subcategories || "",
            sellerId: lot.sellerId || "",
            title: lot.title || "",
            incrementValue: lot.incrementValue || "",
            startPrice: lot.startPrice || "",
            startTime: lot.startTime || "",
            regionId: lot.region.id || "",
            districtId: lot.district.id || "",
            description: lot.description || "",
            attributes: lot.attributes || "",
            incrementType: lot.incrementType || "",
        }));
    }, [lot]);

    useEffect(() => {
        if (lot.lotTypeId) {
            setFormData(prev => ({ ...prev, lotTypeId: lot.lotTypeId }));
        }
    }, [lot.lotTypeId]);

    useEffect(() => {
        if (formData.regionId) {
            fetchDistricts(formData.regionId);
        }
    }, [formData.regionId]);

    useEffect(() => {
        if (lotTypes && formData.lotTypeId) {
            const selected = lotTypes.find(lotType => lotType.id === formData.lotTypeId);
            if (selected) {
                setLotTypeAttributes(selected.attributes || []);
                setLotTypeSubs(selected.subCategories || []);
            } else {
                setLotTypeAttributes([]);
                setLotTypeSubs([]);
            }
        }
    }, [formData.lotTypeId, lotTypes]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageDelete = async (imageId) => {
        try {
            await api.delete(`/lot-image/${imageId}`);
            const updatedImages = formData.lotImageDtoList.filter(
                (image) => image.id !== imageId
            );
            setFormData((prev) => ({ ...prev, lotImageDtoList: updatedImages }));
            refetchSellerId();
            refetchAll();
            refetchLot();
            refetchLotImg()
            toast.success("Image deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete image.");
            console.error(error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const updatedFormData = {
            ...formData,
            attributes: JSON.stringify(formData.attributes),
        };

        updateLot(updatedFormData);
    };


    const closeImageModal = (newImages) => {
        setImageModalOpen(false);
        if (newImages.length) {
            setFormData((prev) => ({
                ...prev,
                lotImageDtoList: [...prev.lotImageDtoList, ...newImages],
            }));
        }
    };

    const getLocalizedName = (name) => {
        try {
            const parsedName = name;
            return parsedName[locale] || parsedName.en || "Unknown";
        } catch (error) {
            return "Unknown";
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} height="100%" overflow="auto">
            <Typography variant="h6" sx={{ mb: 2 }}>
                <FormattedMessage id="lot.edit" />
            </Typography>
            <Box display="flex" flexDirection={{ xs: "column", lg: "row" }} gap={3}>
                <Box flex={1} width={{ xs: "100%", lg: "40%" }}>
                    <TextField
                        label={intl.formatMessage({ id: 'title' })}
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label={intl.formatMessage({ id: 'description' })}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label={intl.formatMessage({ id: 'starttime' })}
                        name="startPrice"
                        type="number"
                        value={formData.startPrice}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <Box display="flex" gap={2}>
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel id="increment-type-label">Increment Type</InputLabel>
                            <Select
                                labelId="increment-type-label"
                                label="Increment type"
                                name="incrementType"
                                value={formData.incrementType}
                                onChange={handleChange}
                            >
                                <MenuItem value="FIXED">Fixed</MenuItem>
                                <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label={
                                formData.incrementType === "PERCENTAGE"
                                    ? "Increment Value (%)"
                                    : "Increment Value (Number)"
                            }
                            name="incrementValue"
                            type="number"
                            value={formData.incrementValue}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                    </Box>
                    <Box display="flex" gap={2}>
                        <DateTimePicker
                            label={intl.formatMessage({ id: 'starttime' })}
                            value={formData.startTime ? dayjs(formData.startTime) : null}
                            onChange={(newValue) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    startTime: newValue ? newValue.format("YYYY-MM-DDTHH:mm:ss") : "",
                                }));
                            }}
                            ampm={false}
                            format="DD.MM.YYYY HH:mm"
                            sx={{ width: "100%", mt: 2 }}
                        />
                    </Box>
                    <div className="flex gap-2">
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel id="lot-type-label"><FormattedMessage id="region" /></InputLabel>
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
                            <InputLabel id="lot-type-label"><FormattedMessage id="district" /></InputLabel>
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
                    <div className="flex gap-2">
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel id="lot-type-label"><FormattedMessage id="lottype" /></InputLabel>
                            <Select
                                labelId="lot-type-label"
                                label={intl.formatMessage({ id: 'lottype' })}
                                name="lotTypeId"
                                value={formData.lotTypeId}
                                onChange={handleChange}
                            >
                                {lotTypes?.map((lotType, i) => {
                                    // Parse lotType.name and choose the current language version
                                    // const lotTypeName = JSON.parse(lotType.name);
                                    // const lotTypeLocalized = lotTypeName[intl.locale]; // Get the correct translation
                                    return (
                                        <MenuItem value={lotType.id} key={i}>
                                            {getLocalizedName(lotType.name)} {lotType.description && ` - ${lotType.description}`}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel id="sub-label"><FormattedMessage id="subcat" /></InputLabel>
                            <Select
                                labelId="sub-label"
                                label={intl.formatMessage({ id: 'subcat' })}
                                name="subcategories"
                                value={formData.subcategories} // ✅ Only uses formData
                                onChange={handleChange}
                            >
                                {lotTypeSubs.length > 0 ? (
                                    lotTypeSubs.map((sub, i) => (
                                        <MenuItem value={sub.name} key={i}>
                                            {sub.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled><FormattedMessage id="nosubcat" /></MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </div>
                    {lotTypeAttributes.length > 0 && (
                        <Grid container spacing={3} py={2}>
                            {lotTypeAttributes.map((attribute, index) => (
                                <Grid item xs={6} key={index}>
                                    <TextField
                                        fullWidth
                                        label={attribute.name}
                                        name={attribute.name}
                                        value={formData.attributes[attribute.name] || ""}
                                        onChange={handleAttributeChange}
                                        required
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
                <Box flex={1} width={{ xs: "100%", lg: "60%" }}>
                    <Typography variant="subtitle1" gutterBottom>
                        <FormattedMessage id="images" />
                    </Typography>
                    <Grid container spacing={2} sx={{ my: 2 }}>
                        {lotImages?.map((image) => (
                            <Grid item xs={12} md={6} lg={6} key={image.id}>
                                <Box
                                    component="img"
                                    src={image.imageUrl}
                                    alt={image.name}
                                    sx={{ width: "100%", objectFit: "cover", borderRadius: "10px" }}
                                />
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleImageDelete(image.id)}
                                    sx={{ mt: 1 }}
                                >
                                    <Delete />
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                    <Button
                        variant="outlined"
                        startIcon={<AddPhotoAlternate />}
                        fullWidth
                        onClick={() => setImageModalOpen(true)}
                    >
                        <FormattedMessage id="uploadimg" />
                    </Button>
                </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={isUpdating}
                >
                    {isUpdating ? `${intl.formatMessage({ id: 'lot.edit' })}...` : intl.formatMessage({ id: 'lot.edit' })}
                </Button>
            </Box>
            <ImageUploadModal
                auctionId={auction.id}
                open={isImageModalOpen}
                onClose={closeImageModal}
                userId={userId}
            />
        </Box>
    );
};

export default EditLotForm;
