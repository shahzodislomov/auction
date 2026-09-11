import React, { useState, useEffect } from "react";
import DialogModal from "@/components/ui/DialogModal";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, TextField, Typography } from "@mui/material";
import { useLotTypes, useUpdateLotTypeMutation } from "@/queries/lot-types";
import { toast } from "react-toastify";
import ImageUploader from "./ImageUploader";

export default function EditType({ open, setOpen, data }) {
    const intl = useIntl();
    const { refetch } = useLotTypes();
    const [resetKey, setResetKey] = useState(Date.now());

    // Initialize form state
    const [formData, setFormData] = useState({
        name: { uz: "", en: "", ru: "" },
        image: null,
    });

    // Update form data when `data` changes
    useEffect(() => {
        if (data) {
            setFormData({
                name: { uz: data?.name?.uz || "", en: data?.name?.en || "", ru: data?.name?.ru || "" },
                image: data?.imageUrl || null,
            });
        }
    }, [data]);

    const { mutate: updateLotType, isLoading: isUpdating } = useUpdateLotTypeMutation(
        () => {
            toast.success("Lot type updated successfully!");
            refetch();
            setOpen(false);
        },
        () => toast.error("Failed to update lot type.")
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            name: { ...prev.name, [name]: value },
        }));
    };

    const handleImageChange = (file) => {
        setFormData((prev) => ({
            ...prev,
            image: file,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.uz || !formData.name.en || !formData.name.ru) {
            toast.error("Please fill in all fields.");
            return;
        }

        const formattedData = {
            id: data?.id, // Ensure the ID is sent for updating
            name: JSON.stringify(formData.name),
            image: formData.image,
        };

        updateLotType(formattedData);

        // Reset the file input and force re-render of ImageUploader
        setResetKey(Date.now());
    };

    return (
        <DialogModal title={intl.formatMessage({ id: "edit" })} open={open} setOpen={setOpen} maxWidth="sm">
            <div className="flex flex-col mb-4 gap-4">
                <div className="space-y-4">
                    <Typography>
                        <FormattedMessage id='name' />
                    </Typography>
                    <TextField label="O'zbek" name="uz" value={formData.name.uz} onChange={handleChange} required fullWidth variant="outlined" size="small" />
                    <TextField label="English" name="en" value={formData.name.en} onChange={handleChange} required fullWidth variant="outlined" size="small" />
                    <TextField label="Русский" name="ru" value={formData.name.ru} onChange={handleChange} required fullWidth variant="outlined" size="small" />
                </div>

                {/* Image Uploader with resetKey */}
                <ImageUploader key={resetKey} onImageUpload={handleImageChange} initialImage={formData.image} />

            </div>
            <Button variant="contained" color="primary" disabled={isUpdating} fullWidth onClick={handleSubmit}>
                {isUpdating ? "Tahrirlash..." : "Tahrirlash"}
            </Button>
        </DialogModal>
    );
}
