import { useIntl } from "react-intl";
import DialogModal from "@/components/ui/DialogModal";
import { toast } from "react-toastify";
import { useState } from "react";
import { useCreateAttrOption } from "@/queries/attributes";
import { Button, TextField, Typography } from "@mui/material";

const OptionsCreateModal = ({ open, setOpen, attr }) => {
    const intl = useIntl();

    const [formData, setFormData] = useState({
        name: { uz: "", en: "", ru: "" },
    });

    const { mutate: createOption, isLoading: isCreating } = useCreateAttrOption(
        () => {
            toast.success("Option created successfully!");
            setFormData({ name: { uz: "", en: "", ru: "" } });
            setOpen(false);
        },
        () => toast.error("Failed to create option.")
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.uz || !formData.name.en || !formData.name.ru) {
            toast.error("Please fill in all fields.");
            return;
        }

        const formattedData = {
            uz: formData.name.uz,
            en: formData.name.en,
            ru: formData.name.ru
        };

        createOption(
            formattedData,
            {
                attributeId: attr?.id || null
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            name: { ...prev.name, [name]: value }
        }));
    };

    return (
        <DialogModal
            title={intl.formatMessage({ id: 'createOption' })}
            open={open}
            setOpen={setOpen}
        >
            <div className="text-[20px] font-semibold">{attr?.name?.uz}</div>
            <div className="space-y-4 mb-4">
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
    );
};

export default OptionsCreateModal;