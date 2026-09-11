import React, { useState } from 'react'
import DialogModal from '@/components/ui/DialogModal'
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { useAttr, useCreateLotAttribute } from '@/queries/attributes';
import { Button, MenuItem, Select, Switch, TextField, Typography } from '@mui/material';

export default function CreateAttribute({ open, setOpen }) {
    const intl = useIntl();
    const { refetch } = useAttr();

    const [formData, setFormData] = useState({
        name: { uz: "", en: "", ru: "" },
        valueType: "",
        isSelectable: false,
    })

    const { mutate: createAttribute, isLoading: isCreating } = useCreateLotAttribute(
        (data) => {
            if (data.status === "OK") {
                toast.success("Attribute created successfully!");
                refetch();
                setFormData({ name: { uz: "", en: "", ru: "" }, valueType: "", isSelectable: false });
                setOpen(false);
            } else {
                toast.error(data.message)
            }
        },
        () => toast.error("Failed to create attribute.")
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            name: name === "uz" || name === "en" || name === "ru"
                ? { ...prev.name, [name]: value }
                : prev.name,
            [name]: !(name === "uz" || name === "en" || name === "ru") ? value : prev[name]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.uz || !formData.name.en || !formData.name.ru || formData.valueType === "") { // Add a check for valueType
            toast.error("Please fill in all fields.");
            return;
        }
        const formattedData = {
            name: formData.name,
            valueType: formData.valueType,
            isSelectable: formData.isSelectable,
        };
        createAttribute(formattedData);

        // Reset the file input, image state, and form data
        setFormData({ name: { uz: "", en: "", ru: "" }, valueType: "", isSelectable: false });
    };


    return (
        <div>
            <DialogModal open={open} setOpen={setOpen} title={intl.formatMessage({ id: "create_attr" })}>
                <div className="space-y-3">
                    <Typography><FormattedMessage id="name" /></Typography>
                    <TextField
                        label="O'zbek"
                        name="uz"
                        value={formData.name.uz}
                        onChange={handleChange}
                        required
                        fullWidth
                        variant="outlined"
                        size="small"
                    />
                    <TextField
                        label="English"
                        name="en"
                        value={formData.name.en}
                        onChange={handleChange}
                        required
                        fullWidth
                        size="small"
                        variant="outlined"
                    />
                    <TextField
                        label="Русский"
                        name="ru"
                        value={formData.name.ru}
                        onChange={handleChange}
                        required
                        fullWidth
                        size="small"
                        variant="outlined"
                    />

                    <div className="flex items-center gap-2">
                        <div className="w-1/2">
                            <Typography><FormattedMessage id="value_type" /></Typography>
                            <Select
                                name="valueType"
                                value={formData.valueType}
                                onChange={handleChange}
                                required
                                fullWidth
                                variant="outlined"
                                size="small"
                                displayEmpty
                            >
                                <MenuItem value="" disabled>None</MenuItem>
                                <MenuItem value="STRING">String</MenuItem>
                                <MenuItem value="INTEGER">Integer</MenuItem>
                                <MenuItem value="BOOLEAN">Boolean</MenuItem>
                                <MenuItem value="DATE">Date</MenuItem>
                                <MenuItem value="DATETIME">Date Time</MenuItem>
                                <MenuItem value="TIME">Time</MenuItem>
                            </Select>
                        </div>

                        <div className="w-1/2">
                            <Typography><FormattedMessage id="isSelectable" /></Typography>
                            <Switch
                                name="isSelectable"
                                checked={formData.isSelectable}
                                inputProps={{ 'aria-label': 'controlled' }}
                                onChange={(e) => setFormData((prev) => ({ ...prev, isSelectable: e.target.checked }))}
                            />
                        </div>
                    </div>

                    <Button
                        variant="contained"
                        color="primary"
                        disabled={isCreating}
                        fullWidth
                        onClick={handleSubmit}
                    >
                        <FormattedMessage id="create" />
                        {isCreating ? "..." : ""}
                    </Button>
                </div>
            </DialogModal>
        </div>
    )
}
