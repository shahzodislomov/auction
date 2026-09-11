import React from 'react'
import DialogModal from '@/components/ui/DialogModal'
import { FormattedMessage, useIntl } from 'react-intl'
import { useAttrOptions } from '@/queries/attributes';
import Loader from '@/components/Loader';
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';

export default function OptionsModal({ open, setOpen, attr }) {
    const intl = useIntl();
    const { data: optData, isLoading } = useAttrOptions(attr?.id);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className='space-y-5'>
            <DialogModal
                title={intl.formatMessage({ id: 'selectOptions' })}
                open={open}
                setOpen={setOpen}
            >
                <Typography sx={{mb: 2}}>{attr?.name.uz}</Typography>
                <Table size='small'>
                    <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell><FormattedMessage id='name' /></TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {optData?.map((opt) => (
                            <TableRow key={opt?.id}>
                                <TableCell component="th" scope="row">
                                    {opt.id}
                                </TableCell>
                                <TableCell>{opt.value.uz} / {opt.value.en} / {opt.value.ru}</TableCell>
                                <TableCell align='right'>
                                    <IconButton>
                                        <Delete color='error' />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogModal>
        </div>
    )
}
