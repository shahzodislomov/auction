import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { useCreateSubType, useSub } from '@/queries/subtypes';
import DialogModal from '@/components/ui/DialogModal';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useLotTypes } from '@/queries/lot-types';

export default function CreateSubType({ open, setOpen }) {
  const { data: allTypes, isLoading: typesLoading } = useLotTypes();
  const intl = useIntl();
  const { refetch } = useSub();

  const [formData, setFormData] = useState({
    name: { uz: "", en: "", ru: "" },
    lotTypeId: null
  });

  const { mutate: createSubType, isLoading: isCreating } = useCreateSubType(
    (data) => {
      if (data.status === "OK") {
        toast.success("Sub type created successfully!");
        setOpen(false);
        refetch();
        setFormData({ name: { uz: "", en: "", ru: "" } });
      } else {
        toast.info("Error")
      }
    },
    () => toast.error("Failed to create lot type.")
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      name: name in prev.name ? { ...prev.name, [name]: value } : prev.name,
      lotTypeId: name === "lotTypeId" ? value : prev.lotTypeId
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.uz || !formData.name.en || !formData.name.ru || !formData.lotTypeId) {
      toast.error("Please fill in all fields.");
      return;
    }

    createSubType(formData);

    setFormData({ name: { uz: "", en: "", ru: "" }, lotTypeId: null });
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
        <div className="space-y-4">
          <Typography><FormattedMessage id='lotType' /></Typography>
          <FormControl size='small' fullWidth>
            <InputLabel id="demo-simple-select-autowidth-label"><FormattedMessage id='lotTypes' /></InputLabel>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              name='lotTypeId'
              value={formData.lotTypeId}
              label={intl.formatMessage({ id: 'lotTypes' })}
              onChange={handleChange}
            >
              {allTypes?.map((types, i) => (
                <MenuItem value={types?.id} key={i}>
                  {types?.name?.uz} / {types?.name?.en} / {types?.name?.ru}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
      <Button
        variant="contained"
        color="primary"
        disabled={isCreating || typesLoading}
        fullWidth
        onClick={handleSubmit}
      >
        {isCreating || typesLoading ? "Yaratish..." : "Yaratish"}
      </Button>
    </DialogModal>
  )
}
