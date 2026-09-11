import { AddCircle, Delete, Edit, Visibility } from '@mui/icons-material'
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useAttr, useDeleteAttr } from '@/queries/attributes'
import Loader from '@/components/Loader'
import OptionsModal from './OptionsModal'
import { toast } from 'react-toastify';
import { useIntl } from 'react-intl';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import OptionsCreateModal from './OptionsCreateModal'

export default function AttributesRow({ setEditModal, setAttrToEdit }) {
    const [optionModal, setOptionModal] = useState(false);
    const [optionCreateModal, setOptionCreateModal] = useState(false);
    const [selectedAttr, setSelectedAttr] = useState();
    const { data: attrData, isLoading: attrLoading } = useAttr();

    const intl = useIntl();

    const { mutate: deleteAttr } = useDeleteAttr(
        (data) => {
            if (data.status === "OK") {
                toast.success("Attribute deleted successfully!");
                // refetch();
            } else {
                toast.info(data.message)
            }
        }
    );

    const handleDelete = (id) => {
        const MySwal = withReactContent(Swal);

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
                deleteAttr(id)
            }
        });
    }

    if (attrLoading) {
        return <Loader />;
    }
    return (
        <div>
            <Table size="small" aria-label="purchases">
                <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell><FormattedMessage id='name' /></TableCell>
                        <TableCell align="left">Value type</TableCell>
                        <TableCell align="left">Select options</TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {attrData?.map((attr) => (
                        <TableRow key={attr.id}>
                            <TableCell component="th" scope="row">
                                {attr.id}
                            </TableCell>
                            <TableCell>{attr.name.uz} / {attr.name.en} / {attr.name.ru}</TableCell>
                            <TableCell align="left">
                                {attr.valueType}
                            </TableCell>
                            <TableCell>
                                {attr.isSelectable ? (
                                    <div className="flex">
                                        <IconButton
                                            onClick={() => (
                                                setOptionModal(true),
                                                setSelectedAttr(attr)
                                            )}
                                        >
                                            <Visibility color='primary' />
                                        </IconButton>

                                        <IconButton
                                            onClick={() => (
                                                setOptionCreateModal(true),
                                                setSelectedAttr(attr)
                                            )}
                                        >
                                            <AddCircle color='primary' />
                                        </IconButton>
                                    </div>
                                ) : "-"}
                            </TableCell>
                            <TableCell align='right'>
                                <IconButton
                                    onClick={() => handleDelete(attr.id)}
                                >
                                    <Delete color='error' />
                                </IconButton>
                                <IconButton
                                    onClick={() => (
                                        setEditModal(true),
                                        setAttrToEdit(attr)
                                    )}
                                >
                                    <Edit color='primary' />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <OptionsModal
                open={optionModal}
                setOpen={setOptionModal}
                attr={selectedAttr}
            />

            <OptionsCreateModal
                open={optionCreateModal}
                setOpen={setOptionCreateModal}
                attr={selectedAttr}
            />
        </div >
    )
}
