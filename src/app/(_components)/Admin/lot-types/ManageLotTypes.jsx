"use client"
import React, { useState } from "react";
import {
    Button,
    TextField,
    Grid,
    Typography,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CardMedia,
    Autocomplete,
    Box,
    Alert,
    Chip,
    IconButton,
    InputAdornment,
    Tooltip,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
    useCreateLotTypeMutation,
    useUpdateLotTypeMutation,
    useDeleteLotTypeMutation,
    useLotTypes,
} from "@/queries/lot-types";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useAttr, useCreateLotAttribute, useDeleteAttr } from "@/queries/attributes";
import { useSub, useCreateLotSub, useDeleteSub } from "@/queries/subtypes";
import { Controller, useForm } from "react-hook-form";
import Loader from "@/components/Loader";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Types from "./Types/Types";
import SubTypes from "./sub-types/SubTypes";
import Attributes from "./attributes/Attributes";

export default function ManageLotTypes() {
    // const { locale } = useIntl(); // Get current locale
    // const queryClient = useQueryClient();
    // const [imageFile, setImageFile] = useState(null);
    // const { control, setValue, watch } = useForm({ defaultValues: { tags: [], subs: [] } });
    // const [addAttr, setAddAttr] = useState("");
    // const { refetch } = useLotTypes();

    // const [editing, setEditing] = useState(null);
    // const [deleteId, setDeleteId] = useState(null);

    // const { data: attributes = [], refetch: refetchAttributes } = useAttr();
    // const { data: subCategories = [], refetch: refetchSubCategories } = useSub();

    // const createAttribute = useCreateLotAttribute();
    // const deleteAttr = useDeleteAttr();
    // const selectedAttributes = watch('tags');

    // const createSubCategory = useCreateLotSub();
    // const deleteSubCategory = useDeleteSub();
    // const selectedSubCategories = watch('subs');
    // const [addSub, setAddSub] = useState("");

    // const [formData, setFormData] = useState({
    //     name: { uz: "", en: "", ru: "" },
    //     description: "",
    //     image: null,  // Hold image file here
    // });

    // const toggleAttribute = (attributeName) => {
    //     if (selectedAttributes.includes(attributeName)) {
    //         setValue('tags', selectedAttributes.filter(attr => attr !== attributeName));
    //     } else {
    //         setValue('tags', [...selectedAttributes, attributeName]);
    //     }
    // };

    // const { data: lotTypesData, isLoading: isLotTypesLoading } = useLotTypes(0, 20);
    // const { mutate: createLotType, isLoading: isCreating } = useCreateLotTypeMutation(
    //     () => {
    //         toast.success("Lot type created successfully!");
    //         refetch();
    //         setFormData({ name: { uz: "", en: "", ru: "" }, description: "", image: null });
    //     },
    //     () => toast.error("Failed to create lot type.")
    // );

    // const { mutate: updateLotType, isLoading: isUpdating } = useUpdateLotTypeMutation(
    //     () => {
    //         toast.success("Lot type updated successfully!");
    //         refetch();
    //         setEditing(null);
    //         setFormData({ name: { uz: "", en: "", ru: "" }, description: "", image: null });
    //     },
    //     () => toast.error("Failed to update lot type.")
    // );

    // const { mutate: deleteLotType, isLoading: isDeleting } = useDeleteLotTypeMutation(
    //     () => {
    //         toast.success("Lot type deleted successfully!");
    //         refetch();
    //         setDeleteId(null);
    //     },
    //     () => toast.error("Failed to delete lot type.")
    // );

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prev) => ({
    //         ...prev,
    //         name: { ...prev.name, [name]: value }
    //     }));
    // };

    // const handleDescriptionChange = (e) => {
    //     setFormData((prev) => ({
    //         ...prev,
    //         description: e.target.value
    //     }));
    // };

    // const handleImageChange = (e) => {
    //     const file = e.target.files[0];
    //     setFormData((prev) => ({
    //         ...prev,
    //         image: file,
    //     }));
    // };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     if (!formData.name.uz || !formData.name.en || !formData.name.ru || !formData.description || !selectedAttributes.length || !selectedSubCategories.length) {
    //         toast.error("Please fill in all fields.");
    //         return;
    //     }
    //     const formattedData = {
    //         name: JSON.stringify(formData.name),
    //         description: formData.description,
    //         image: formData.image,
    //         attributes: selectedAttributes,
    //         subCategories: selectedSubCategories,
    //     };

    //     if (editing) {
    //         updateLotType({ id: editing, ...formattedData });
    //     } else {
    //         createLotType(formattedData);
    //     }

    //     // Reset the file input and clear form data
    //     setImageFile(null);
    //     document.getElementById("image-upload").value = "";
    //     setValue('tags', []);
    //     setValue('subs', []);
    // };

    // const handleEdit = (lotType) => {
    //     let parsedName = {};
    //     try {
    //         parsedName = lotType.name ? JSON.parse(lotType.name) : {};
    //     } catch (error) {
    //         parsedName = { uz: "", en: "", ru: "" };
    //     }

    //     setEditing(lotType.id);
    //     setFormData({
    //         name: parsedName,
    //         description: lotType.description,
    //         image: null,
    //     });
    //     setValue('tags', lotType.attributes.map(attr => attr.name) || []);
    //     setValue('subs', lotType.subCategories.map(sub => sub.name) || []);
    // };

    // const handleDelete = (id) => {
    //     setDeleteId(id);
    // };

    // const handleCancel = () => {
    //     setEditing(null);
    //     setFormData({ name: { uz: "", en: "", ru: "" }, description: "", image: null });

    //     // Reset the file input
    //     setImageFile(null);
    //     document.getElementById("image-upload").value = "";
    // };

    // if (isLotTypesLoading) {
    //     return <Loader />
    // }

    // const handleAddAttribute = () => {
    //     const addedAttribute = addAttr && !attributes.some(a => a.name === addAttr.trim());

    //     if (addedAttribute) {
    //         createAttribute.mutate(addAttr.trim(), {
    //             onSuccess: () => {
    //                 refetchAttributes();
    //                 setAddAttr("");
    //             }
    //         });
    //     } else {
    //         setValue('tags', [...new Set(addAttr.split(','))]);  // Split input if multiple tags are provided, remove duplicates
    //     }
    // };

    // const toggleSubCategory = (subCategoryName) => {
    //     if (selectedSubCategories.includes(subCategoryName)) {
    //         setValue('subs', selectedSubCategories.filter(sub => sub !== subCategoryName));
    //     } else {
    //         setValue('subs', [...selectedSubCategories, subCategoryName]);
    //     }
    // };

    // const handleAddSubCategory = () => {
    //     const addedSubCategory = addSub && !subCategories.some(s => s.name === addSub.trim());

    //     if (addedSubCategory) {
    //         createSubCategory.mutate(addSub.trim(), {
    //             onSuccess: () => {
    //                 refetchSubCategories();
    //                 setAddSub("");
    //             }
    //         });
    //     } else {
    //         setValue('subs', [...new Set(addSub.split(','))]);  // Remove duplicates
    //     }
    // };

    return (
        <div className="space-y-2">
            <Alert severity="info">
                <FormattedMessage id="reference.legacy_lot_types" />
            </Alert>
            <Box>
                <div className="flex gap-2 mb-4">
                    <Link href="/admin/managelottypes" className="px-4 py-2 bg-blue-500 text-white rounded">Types</Link>
                    <Link href="/admin/managelottypes/subtypes" className="px-4 py-2 bg-gray-300 rounded">Sub Types</Link>
                    <Link href="/admin/managelottypes/attributes" className="px-4 py-2 bg-gray-300 rounded">Attributes</Link>
                </div>
                <Types />
            </Box>
            {/* <div className="text-2xl">Lot turlari</div>

            <Grid container spacing={3}>
                {lotTypesData?.map((type) => {
                    let parsedName = {};
                    try {
                        parsedName = type.name ? JSON.parse(type.name) : {};
                    } catch (error) {
                        parsedName = {};
                    }

                    const displayName = parsedName?.[locale] || parsedName?.en || "Unknown";

                    return (
                        <Grid item xs={12} sm={6} md={4} lg={4} key={type.id}>
                            <Card elevation={3} className="">
                                <div
                                    className="shadow-lg rounded-t-md flex justify-around bg-primary-light items-center text-white py-2 cursor-pointer"
                                >
                                    <CardContent>
                                        <Typography variant="h5" component="div" className="font-bold mb-2">
                                            {displayName}
                                        </Typography>
                                        <Typography variant="body2" color="text.white">
                                            {type.description}
                                        </Typography>
                                    </CardContent>
                                    <CardMedia
                                        component="img"
                                        image={type.imageUrl}
                                        alt={type.name}
                                        sx={{ objectFit: "cover", height: 70, width: 70 }}
                                        className="rounded-full bg-white"
                                    />
                                </div>
                                <div className="flex justify-end p-1">
                                    <Button size="small" color="primary" onClick={() => handleEdit(type)}>
                                        <Edit />
                                    </Button>
                                    <Button size="small" color="error" onClick={() => handleDelete(type.id)}>
                                        <Delete />
                                    </Button>
                                </div>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            <div className="pt-3 text-2xl">
                {editing ? "Tahrirlash" : "Yangi qo'shish"}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography>Nom</Typography>
                        <div className="space-y-4">
                            <TextField
                                label="O'zbek"
                                name="uz"
                                value={formData.name.uz}
                                onChange={handleChange}
                                required
                                fullWidth
                                variant="outlined"
                            />
                            <TextField
                                label="English"
                                name="en"
                                value={formData.name.en}
                                onChange={handleChange}
                                required
                                fullWidth
                                variant="outlined"
                            />
                            <TextField
                                label="Русский"
                                name="ru"
                                value={formData.name.ru}
                                onChange={handleChange}
                                required
                                fullWidth
                                variant="outlined"
                            />
                        </div>

                        <Box>
                            <Typography>Attributlar</Typography>
                            <Controller
                                name="tags"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        multiple
                                        freeSolo
                                        options={attributes.map(attr => attr.name)} // Use attribute names
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
                                                    onSuccess: () => {
                                                        refetchAttributes();
                                                    }
                                                });
                                            } else {
                                                setValue('tags', [...new Set(newValue)]);  // Remove duplicates before setting the state
                                            }
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
                                                placeholder="Qo'shish"
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
                        </Box>
                        <div className="alltags my-2 flex items-center flex-wrap">
                            {attributes.filter(attr => !selectedAttributes.includes(attr.name)).map((attr) => (
                                <Chip
                                    key={attr.id}
                                    label={attr.name}
                                    onClick={() => toggleAttribute(attr.name)}
                                    onDelete={() => deleteAttr.mutate(attr.id, {
                                        onSuccess: () => {
                                            refetchAttributes();
                                        }
                                    })}
                                    deleteIcon={<Delete />}
                                    sx={{
                                        m: '3px',
                                        cursor: 'pointer',
                                        flexShrink: 0, // Prevent chips from shrinking
                                    }}
                                />
                            ))}

                            <TextField
                                placeholder="Qo'shish"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        borderRadius: '20px',
                                        height: '32px',
                                        width: '150px',
                                    },
                                    m: '3px'
                                }}
                                value={addAttr}
                                onChange={(event) => setAddAttr(event.target.value)} // Update the state on change
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter' && addAttr.trim() !== '') {
                                        handleAddAttribute();  // Trigger the add attribute function on Enter key
                                    }
                                }} InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end" sx={{ p: 0, m: 0 }}>
                                            <Tooltip
                                                title="Qo'shish"
                                            >
                                                <IconButton
                                                    onClick={handleAddAttribute}  // Trigger the add attribute function on Add icon click
                                                    sx={{ p: 0, m: 0 }}  // Remove padding for IconButton
                                                >
                                                    <Add />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>

                                    ),
                                }}
                            />

                        </div>

                        <div className="border rounded-md p-2">
                            <Typography>Rasm</Typography>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                required
                                style={{ width: "100%" }}
                            />
                        </div>

                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography>Ta'rif</Typography>
                        <TextField
                            label="Ta'rif"
                            name="description"
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            required
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                        />
                        <div className="py-4">
                            <Box>
                                <Typography>Sub kategoriya</Typography>
                                <Controller
                                    name="subs"
                                    control={control}
                                    render={({ field }) => (
                                        <Autocomplete
                                            multiple
                                            freeSolo
                                            options={subCategories.map(sub => sub.name)} // Use subcategory names
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
                                                const addedSubCategory = newValue.find(sub => !subCategories.some(s => s.name === sub));
                                                if (addedSubCategory) {
                                                    createSubCategory.mutate(addedSubCategory, {
                                                        onSuccess: () => {
                                                            refetchSubCategories();
                                                        }
                                                    });
                                                } else {
                                                    setValue('subs', [...new Set(newValue)]);
                                                }
                                            }}

                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        label={option} {...getTagProps({ index })}
                                                        sx={{ border: '1px solid #1E88E5' }}
                                                    />
                                                ))
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Qo'shish"
                                                    sx={{ '& .MuiInputBase-root': { padding: 1 } }}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Box>
                            <div className="allsubs my-2 flex items-center flex-wrap">
                                {subCategories.filter(sub => !selectedSubCategories.includes(sub.name)).map((sub) => (
                                    <Chip
                                        key={sub.id}
                                        label={sub.name}
                                        onClick={() => toggleSubCategory(sub.name)}
                                        onDelete={() => deleteSubCategory.mutate(sub.id, {
                                            onSuccess: () => {
                                                refetchSubCategories();
                                            }
                                        })}
                                        deleteIcon={<Delete />}
                                        sx={{
                                            m: '3px',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                        }}
                                    />
                                ))}

                                <TextField
                                    placeholder="Qo'shish"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            borderRadius: '20px',
                                            height: '32px',
                                            width: '150px'
                                        },
                                        m: '3px'
                                    }}
                                    value={addSub}
                                    onChange={(event) => setAddSub(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' && addSub.trim() !== '') {
                                            handleAddSubCategory();
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end" sx={{ p: 0, m: 0 }}>
                                                <Tooltip title="Qo'shish">
                                                    <IconButton
                                                        onClick={handleAddSubCategory}
                                                        sx={{ p: 0, m: 0 }}
                                                    >
                                                        <Add />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </div>

                        </div>
                    </Grid>
                </Grid>

                <Button
                    variant="contained"
                    color="primary"
                    disabled={isCreating || isUpdating}
                    fullWidth
                    onClick={handleSubmit}
                >
                    {isCreating || isUpdating
                        ? editing
                            ? "Tahrirlash..."
                            : "Yaratish..."
                        : editing
                            ? "Tahrirlash"
                            : "Yaratish"}
                </Button>

                {editing && (
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleCancel}
                        fullWidth
                    >
                        Cancel
                    </Button>
                )}
            </form>

            {
                deleteId && (
                    <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to delete this lot type? This action cannot be undone.
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDeleteId(null)} color="primary">
                                Cancel
                            </Button>
                            <Button
                                onClick={() => deleteLotType(deleteId)}
                                color="error"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                )
            } */}
        </div >
    );
}
