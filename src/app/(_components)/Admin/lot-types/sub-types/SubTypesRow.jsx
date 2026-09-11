import { Delete, Edit, RemoveRedEye } from '@mui/icons-material'
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import MySwal from "sweetalert2";
import { useDeleteSub } from '@/queries/subtypes';
import { toast } from 'react-toastify';

export default function SubTypesRow({
    subTypeData, 
    setAttrModal, 
    setSelectedSubType,
    setEditModal,
    setTypeToEdit
}) {
    const intl = useIntl()

    const { mutate: deleteSubType, isLoading: isDeleting } = useDeleteSub(
        (data) => {
            if (data.status === "OK") {
                toast.success("Sub type deleted successfully!");
                // refetch();
            } else {
                toast.info(data.message)
            }
        }
    );

    const handleDelete = (id) => {
        MySwal.fire({
            title: intl.formatMessage({ id: 'confirm_title' }),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: intl.formatMessage({ id: 'confirm_delete' }),
            cancelButtonText: intl.formatMessage({ id: 'cancel' })
        }).then((result) => {
            if (result.isConfirmed) {
                deleteSubType(id)
            }
        });
    }
    return (
        <div>
            <Table size="small" aria-label="purchases">
                <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell><FormattedMessage id='name' /></TableCell>
                        <TableCell align="left">Slug</TableCell>
                        <TableCell align="right">Attributes</TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {subTypeData?.map((sub) => (
                        <TableRow key={sub.id}>
                            <TableCell component="th" scope="row">
                                {sub.id}
                            </TableCell>
                            <TableCell>{sub.name.uz} / {sub.name.en} / {sub.name.ru}</TableCell>
                            <TableCell align="left">
                                {sub.slug}
                            </TableCell>
                            <TableCell align="right">
                                <IconButton
                                    onClick={() => (setAttrModal(true), setSelectedSubType(sub.id))}
                                >
                                    <RemoveRedEye />
                                </IconButton>
                            </TableCell>
                            <TableCell align='right'>
                                <IconButton
                                    onClick={() => handleDelete(sub.id)}
                                >
                                    <Delete color='error' />
                                </IconButton>
                                <IconButton
                                    onClick={() => (setEditModal(true), setTypeToEdit(sub))}
                                >
                                    <Edit color='primary' />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
