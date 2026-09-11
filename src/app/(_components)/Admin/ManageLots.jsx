import { getStorageItem } from "@/utils/storage";
import {
    Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
    Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Tabs, Tab, Modal
} from '@mui/material';
import React, { useState } from 'react';
import NextLink from "next/link";
import { useAllLots, useAllLotsApproved, useAllLotsBySellerId, useAllLotsDeclined, useDeleteLotMutation } from '@/queries/lots';
import { toast } from 'react-toastify';
import { useQueryClient } from "@tanstack/react-query";
import { Approval, CheckCircle, Delete, Done } from '@mui/icons-material';
import ApproveModal from './ApproveModal';
import { AuctionStatusBadge } from '@/components/ui/StatusBadge';

function CustomTabPanel({ children, value, index }) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

export default function ManageLots() {
    const userId = getStorageItem('userId')
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [lotToDelete, setLotToDelete] = useState(null);
    const [lotToApprove, setLotToApprove] = useState(null);
    const [approveModal, setApproveModal] = useState(false);
    const queryClient = useQueryClient();
    const { data, refetch } = useAllLots();
    const { data: approvedData, refetch: refetchApr } = useAllLotsApproved();
    const { data: declinedData, refetch: refetchDeclined } = useAllLotsDeclined();

    const { refetch: refetchSellerId } = useAllLotsBySellerId(userId, 0, 20);
    const { refetch: refetchAll } = useAllLots();

    const { mutate: deleteLot } = useDeleteLotMutation(
        () => {
            toast.success("Lot deleted successfully!");
            refetchSellerId();
            refetchAll();
            setLotToDelete(null);
        },
        (error) => {
            toast.error("Failed to delete lot.");
            console.error(error);
        }
    );

    const handleDelete = (lot) => {
        setLotToDelete(lot);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (lotToDelete) {
            deleteLot(lotToDelete.id);
            setConfirmDeleteOpen(false);
        }
    };

    const handleCloseModal = () => {
        setConfirmDeleteOpen(false);
        setLotToDelete(null);
    };

    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-semibold px-4">Manage lots</h1>
            <Divider />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="lots tabs">
                    <Tab label="All lots" {...a11yProps(0)} />
                    <Tab label="Approved lots" {...a11yProps(1)} />
                    <Tab label="Declined lots" {...a11yProps(2)} />
                </Tabs>
            </Box>

            <CustomTabPanel value={value} index={0}>
                <TableContainer component={Paper} sx={{ overflowX: "auto", maxWidth: "100%" }} className="my-2">
                    <Table sx={{ minWidth: 650 }} aria-label="lots table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Lot Id</TableCell>
                                <TableCell align="center">Seller id</TableCell>
                                <TableCell align="center">Title</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Created at</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.map((row) => (
                                <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                    <TableCell component={NextLink} href={`/lots/${row.id}`} align="left" scope="row">
                                        {row.id}
                                    </TableCell>
                                    <TableCell align="center">{row.sellerId}</TableCell>
                                    <TableCell align="center">{row.title}</TableCell>
                                    <TableCell align="center"><AuctionStatusBadge status={row.lotStatus} /></TableCell>
                                    <TableCell align="center">{new Date(row.startTime).toLocaleString()}</TableCell>
                                    <TableCell align="right">
                                        <Delete onClick={() => handleDelete(row)} className="cursor-pointer" color="error" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={1}>
                <TableContainer component={Paper} className="my-2">
                    <Table sx={{ minWidth: 650 }} aria-label="lots table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Lot Id</TableCell>
                                <TableCell align="center">Seller id</TableCell>
                                <TableCell align="center">Title</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Created at</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {approvedData?.map((row) => (
                                <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                    <TableCell component={NextLink} href={`/lots/${row.id}`} align="left" scope="row">
                                        {row.id}
                                    </TableCell>
                                    <TableCell align="center">{row.sellerId}</TableCell>
                                    <TableCell align="center">{row.title}</TableCell>
                                    <TableCell align="center">{row.lotStatus}</TableCell>
                                    <TableCell align="center">{new Date(row.startTime).toLocaleString()}</TableCell>
                                    <TableCell align="right">
                                        <Delete onClick={() => handleDelete(row)} className="cursor-pointer" color="error" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={2}>
                <TableContainer component={Paper} className="my-2">
                    <Table sx={{ minWidth: 650 }} aria-label="lots table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Lot Id</TableCell>
                                <TableCell align="center">Seller id</TableCell>
                                <TableCell align="center">Title</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Created at</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {declinedData?.map((row) => (
                                <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                    <TableCell component={NextLink} href={`/lots/${row.id}`} align="left" scope="row">
                                        {row.id}
                                    </TableCell>
                                    <TableCell align="center">{row.sellerId}</TableCell>
                                    <TableCell align="center">{row.title}</TableCell>
                                    <TableCell align="center">{row.lotStatus}</TableCell>
                                    <TableCell align="center">{new Date(row.startTime).toLocaleString()}</TableCell>
                                    <TableCell align="right">
                                        <Delete onClick={() => handleDelete(row)} className="cursor-pointer" color="error" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CustomTabPanel>

            {/* Confirmation Modal for Deletion */}
            <Dialog open={isConfirmDeleteOpen} onClose={handleCloseModal}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this lot?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error">Confirm</Button>
                </DialogActions>
            </Dialog>
            <Modal open={approveModal} onClose={() => setApproveModal(false)} className='flex justify-center items-center'>
                <ApproveModal
                    lot={lotToApprove}
                    close={() => setApproveModal(false)}
                    refetch={refetch}
                    refetchApr={refetchApr}
                    refetchDeclined={refetchDeclined}
                />
            </Modal>
        </div>
    );
}