import React, { useEffect, useState } from 'react'
import DialogModal from '@/components/ui/DialogModal';
import { FormattedMessage, useIntl } from 'react-intl';
import { useUpdateSubTypeMutation } from '@/queries/subtypes';
import { toast } from 'react-toastify';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useLotTypes } from '@/queries/lot-types';

export default function EditSubType({
  open,
  setOpen,
  data
}) {
  const intl = useIntl();
  const { data: allTypes } = useLotTypes();

  const [formData, setFormData] = useState({
    name: { uz: "", en: "", ru: "" },
    lotTypeId: null,
  })

  useEffect(() => {
    if (data) {
      setFormData({
        name: { uz: data?.name?.uz || "", en: data?.name?.en || "", ru: data?.name?.ru || "" },
        lotTypeId: data?.lotTypeId || null,
      });
    }
  }, [data])

  const { mutate: updateSubType, isLoading: isUpdating } = useUpdateSubTypeMutation(
    (data) => {
      if (data.status === "OK") {
        toast.success("Sub typ updated successfully");
        setOpen(false)
      } else {
        toast.info(data.message)
      }
    },
    () => toast.error("Failed to update sub type")
  )

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      name: { ...prev.name, [name]: value },
      lotTypeId: prev.lotTypeId
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.uz || !formData.name.en || !formData.name.ru || !formData.lotTypeId) {
      toast.error("Please fill in all fields.");
      return;
    }

    const formattedData = {
      id: data?.id,
      name: formData.name,
      lotTypeId: formData.lotTypeId
    }

    updateSubType(formattedData);
  }

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
      <Button variant="contained" color="primary" disabled={isUpdating} fullWidth onClick={handleSubmit}>
        {isUpdating ? "Tahrirlash..." : "Tahrirlash"}
      </Button>
    </DialogModal>
  )
}
