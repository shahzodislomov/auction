import React, { useState } from 'react'
import DialogModal from '@/components/ui/DialogModal'
import { useIntl } from 'react-intl'
import { Button, TextField, Typography } from '@mui/material';
import { useCreateLotTypeMutation, useLotTypes } from '@/queries/lot-types';
import { toast } from 'react-toastify';
import ImageUploader from './ImageUploader';

export default function CreateType({ open, setOpen }) {
    const intl = useIntl();
    const [imageFile, setImageFile] = useState(null);
    const [resetKey, setResetKey] = useState(Date.now());
    const { refetch } = useLotTypes();

    const [formData, setFormData] = useState({
        name: { uz: "", en: "", ru: "" },
        image: null,
    });

    const { mutate: createLotType, isLoading: isCreating } = useCreateLotTypeMutation(
        () => {
            toast.success("Lot type created successfully!");
            refetch();
            setFormData({ name: { uz: "", en: "", ru: "" }, image: null });
            setOpen(false);
        },
        () => toast.error("Failed to create lot type.")
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            name: { ...prev.name, [name]: value }
        }));
    };

    const handleImageChange = (file) => {
        // const file = e.target.files[0];
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
            name: JSON.stringify(formData.name),
            image: formData.image,
        };
        createLotType(formattedData);

        // Reset the file input, image state, and form data
        setImageFile(null);
        setResetKey(Date.now()); // Force ImageUploader to re-render
        setFormData({ name: { uz: "", en: "", ru: "" }, image: null });
    };
    return (
        <DialogModal title={intl.formatMessage({ id: 'create' })} open={open} setOpen={setOpen} maxWidth='sm'>
            <div className="flex flex-col mb-4 gap-4">
                <div className="space-y-4">
                    <Typography>Nom</Typography>
                    <TextField
                        label="O'zbek"
                        name="uz"
                        value={formData.name.uz}
                        onChange={handleChange}
                        required
                        fullWidth
                        variant="outlined"
                        size='small'
                    />
                    <TextField
                        label="English"
                        name="en"
                        value={formData.name.en}
                        onChange={handleChange}
                        required
                        fullWidth
                        size='small'
                        variant="outlined"
                    />
                    <TextField
                        label="Русский"
                        name="ru"
                        value={formData.name.ru}
                        onChange={handleChange}
                        required
                        fullWidth
                        size='small'
                        variant="outlined"
                    />
                </div>
                <ImageUploader key={resetKey} onImageUpload={(file) => handleImageChange(file)} />
            </div>
            <Button
                variant="contained"
                color="primary"
                disabled={isCreating}
                fullWidth
                onClick={handleSubmit}
            >
                {isCreating ? "Yaratish..." : "Yaratish"}
            </Button>
        </DialogModal>
    )
}
