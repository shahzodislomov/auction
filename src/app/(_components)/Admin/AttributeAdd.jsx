import * as React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
    Chip,
    Box
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import { useAttr, useCreateLotAttribute } from '@/queries/attributes';

export default function AttributeModal({ open, onClose }) {
    const { data: attributes = [], refetch } = useAttr();
    const createAttribute = useCreateLotAttribute();
    const { control, setValue, watch } = useForm({ defaultValues: { tags: [] } });
    const selectedAttributes = watch('tags');

    const toggleAttribute = (attribute) => {
        if (selectedAttributes.includes(attribute)) {
            setValue('tags', selectedAttributes.filter(attr => attr !== attribute));
        } else {
            setValue('tags', [...selectedAttributes, attribute]);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <Box>
                <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            multiple
                            freeSolo
                            options={[]}
                            sx={{
                                '& .MuiAutocomplete-inputRoot': {
                                    padding: 0,
                                    borderRadius: '0.5rem',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '&:focus, &:focus-within': {
                                        outline: 'none',
                                    },
                                },
                            }}
                            {...field}
                            value={field.value || []}
                            onChange={(event, newValue) => {
                                const addedAttribute = newValue.find(attr => !attributes.some(a => a.name === attr));
                                if (addedAttribute) {
                                    createAttribute.mutate(addedAttribute, {
                                        onSuccess: () => refetch()
                                    });
                                }
                                setValue('tags', newValue);
                            }}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        label={option} {...getTagProps({ index })}
                                        sx={{
                                            border: '1px solid #1E88E5'
                                        }}
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Attributlar"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            padding: 1,
                                        },
                                    }}
                                />
                            )}
                        />
                    )}
                />
                <div className="alltags my-2">
                    {attributes.filter(attr => !selectedAttributes.includes(attr.name)).map((attr) => (
                        <Chip
                            key={attr.id}
                            label={attr.name}
                            onClick={() => toggleAttribute(attr.name)}
                            sx={{
                                m: '3px',
                                cursor: 'pointer',
                            }}
                        />
                    ))}
                </div>
            </Box>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}
