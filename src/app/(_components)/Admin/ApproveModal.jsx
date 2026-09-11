import {
    Modal, Box, Typography, Button, Grid, IconButton, Card, CardMedia, CardContent, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Breadcrumbs, CircularProgress
} from '@mui/material';
import React, { useState } from 'react';
import { useAllLots, useAllLotsApproved, useApproveLotMutation, useDeclineLotMutation } from '@/queries/lots';
import { toast } from 'react-toastify';
import { useQueryClient } from "@tanstack/react-query";
import { FormattedMessage, useIntl } from 'react-intl';
import { AlarmOff, AlarmOn, AttachMoney, ChevronLeft, ChevronRight, Close, Info, MonetizationOn, Percent, Person, PriceCheck } from '@mui/icons-material';
import dayjs from 'dayjs';
import placeholderImg from '@/assets/placeholder-image.webp'

export default function ApproveModal({ lot, close, refetch, refetchApr, refetchDeclined }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [openFullscreenModal, setOpenFullscreenModal] = useState(false);
    const [openAllImagesModal, setOpenAllImagesModal] = useState(false);
    // const { refetch } = useAllLots();
    // const { refetch: refetchApr } = useAllLotsApproved();
    const intl = useIntl()

    const queryClient = useQueryClient();



    const { mutate: approveLot, isPending: isApproving } = useApproveLotMutation();
    const { mutate: declineLot, isPending: isDeclining } = useDeclineLotMutation();



    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
        setOpenFullscreenModal(true);
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prevIndex) =>
            prevIndex < lot?.lotImageDtoList.length - 1 ? prevIndex + 1 : prevIndex
        );
    };

    const handlePrevImage = () => {
        setSelectedImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    };

    const getLocalizedName = (name) => {
        try {
            const parsedName = name;
            return parsedName[intl.locale] || parsedName.en || "Unknown";
        } catch (error) {
            return "Unknown";
        }
    };

    if (!lot) return null;

    return (
        <div className='bg-white w-[70%] rounded-md overflow-y-auto max-h-screen'>
            <div className="flex justify-between items-center pt-2 px-2">
                <h1 className="text-2xl font-semibold">Lotni tasdiqlash</h1>
                <IconButton onClick={close}>
                    <Close />
                </IconButton>
            </div>
            <Grid container spacing={4} my={2} px={2}>
                {/* Left: Images */}
                <Grid item xs={12} md={7}>

                    <Button
                        variant="outlined"
                        onClick={() => setOpenAllImagesModal(true)}
                        fullWidth
                    >
                        Rasmlarni ko'rish
                    </Button>

                    <Divider sx={{ my: 2 }} />
                    <div className="mb-4 text-[22px] font-semibold">Lot turi</div>
                    <Breadcrumbs aria-label="breadcrumb" >
                        <Typography>
                            {getLocalizedName(lot?.lotType?.name)}
                        </Typography>
                        <Typography>
                            {lot.subcategories}
                        </Typography>
                    </Breadcrumbs>
                    <Divider sx={{ my: 2 }} />
                    <div className="mb-4 text-[22px] font-semibold">To'liq ma'lumotlar</div>
                    <Grid container spacing={1}>
                        {lot?.attributes &&
                            Object.entries(lot.attributes).map(([key, value], i) => (
                                <Grid item xs={4} key={i}>
                                    <div className="bg-gray-100 p-4 block space-y-2 rounded-md">
                                        <strong>{key}:</strong>
                                        <Divider />
                                        <div className="">{value}</div>
                                    </div>
                                </Grid>
                            ))}
                    </Grid>
                </Grid>
                {/* <Grid item xs={12} md={7}>
                    <Card>
                        <CardMedia
                            component="img"
                            image={`${lot?.lotImageDtoList?.[0]?.imageUrl}` || placeholderImg}
                            alt="Main Image"
                            sx={{
                                maxHeight: '70vh'
                            }}
                            height="400"
                            onClick={() => handleImageClick(0)}
                        />
                    </Card>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {lot?.lotImageDtoList?.slice(1, 4).map((image, index) => (
                            <Grid item xs={3} key={index}>
                                <CardMedia
                                    component="img"
                                    image={image.imageUrl}
                                    alt={`Thumbnail ${index}`}
                                    sx={{
                                        height: '100px',
                                        cursor: 'pointer',
                                        borderRadius: '5px',
                                    }}
                                    onClick={() => handleImageClick(index + 1)}
                                />
                            </Grid>
                        ))}
                        {lot?.lotImageDtoList?.length > 4 && (
                            <Grid item xs={3}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setOpenAllImagesModal(true)}
                                    fullWidth
                                    sx={{
                                        height: "100%"
                                    }}
                                >
                                    See All
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Grid> */}

                {/* Right: Lot Details */}
                <Grid item xs={12} md={5}>
                    <div className='border-2 border-t-primary'>
                        <div className="flex justify-end">
                            <div className='font-mono flex items-center bg-primary text-white' >
                                <div className="flex px-3 items-center">
                                    <div className="text-[18px] pr-1">№</div>{` ${lot?.id}`}
                                </div>
                            </div>
                        </div>
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: "center" }}>
                                        <MonetizationOn color='primary' fontSize='small' />
                                        <FormattedMessage id='startprice' defaultMessage="Boshlang'ich narx" />
                                    </Typography>
                                    <div className="flex items-center mt-2 p-2 gap-2">
                                        {/* <AttachMoney color='primary' /> */}
                                        <Typography fontSize={28} fontFamily='monospace'>{lot?.startPrice.toLocaleString()}</Typography>UZS
                                    </div>
                                    <Divider sx={{ mt: 2 }} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: "center" }}>
                                        {lot?.incrementType === "PERCENTAGE" ? <Percent color='primary' /> : <PriceCheck color='primary' fontSize='small' />}
                                        <FormattedMessage id='incrementvalue' defaultMessage={`O'sish - ${lot?.incrementType === "PERCENTAGE" ? "foizda" : "qat`iy narx"}`} />
                                    </Typography>
                                    <div className="flex items-center mt-2 p-2 gap-2">
                                        <Typography fontSize={28} fontFamily='monospace'>{lot?.incrementValue.toLocaleString()}</Typography>
                                        {lot?.incrementType === "FIXED" && "UZS"}
                                        {lot?.incrementType === "PERCENTAGE" && <Percent color='primary' />}
                                    </div>
                                    <Divider sx={{ mt: 2 }} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: "center" }}>
                                        <AlarmOn color='primary' fontSize='small' />
                                        <FormattedMessage id='starttime' defaultMessage={`Boshlanish vaqti`} />
                                    </Typography>
                                    <div className="flex items-center mt-2 p-2">
                                        <Typography fontSize={16} fontFamily="monospace">
                                            {dayjs(lot?.startTime).format('DD.MM.YYYY HH:mm')}
                                        </Typography>

                                    </div>
                                    <Divider sx={{ mt: 2 }} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: "center" }}>
                                        <AlarmOff color='primary' fontSize='small' />
                                        <FormattedMessage id='endtime' defaultMessage={`Tugash vaqti`} />
                                    </Typography>
                                    <div className="flex items-center mt-2 p-2">
                                        <Typography fontSize={16} fontFamily="monospace">
                                            {dayjs(lot?.endTime).format('DD.MM.YYYY HH:mm')}
                                        </Typography>

                                    </div>
                                    <Divider sx={{ mt: 2 }} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)' }}><FormattedMessage id='Title' defaultMessage="Nomi" /></Typography>
                                    <Typography className='items-center mt-2 p-2'>{lot?.title}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)' }}><FormattedMessage id='description' defaultMessage="Tavsifi" /></Typography>
                                    <Typography className='items-center mt-2 p-2'><Info color='primary' /> {lot?.description || "Nomalum"}</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </div>
                </Grid >
                <Grid xs={12} className="flex justify-center mt-4 gap-2">
                    <Button
                        disabled={isApproving || isDeclining}
                        onClick={() =>
                            approveLot(lot.id, {
                                onSuccess: () => {
                                    refetch();
                                    refetchApr();
                                    close();
                                },
                            })}
                        variant="contained"
                        color="success"
                    >
                        {isApproving ? <CircularProgress size={20} color="inherit" /> : "Tasdiqlash"}
                    </Button>

                    <Button
                        disabled={isApproving || isDeclining}
                        onClick={() =>
                            declineLot(lot.id, {
                                onSuccess: () => {
                                    refetch();
                                    refetchApr();
                                    close();
                                },
                            })
                        }
                        variant="contained"
                        color="error"
                    >
                        {isDeclining ? <CircularProgress size={20} color="inherit" /> : "Rad etish"}
                    </Button>

                </Grid>
            </Grid >


            {/* All Images Modal */}
            < Dialog
                open={openAllImagesModal}
                onClose={() => setOpenAllImagesModal(false)
                }
                fullWidth
            >
                <DialogTitle>All Images</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        {lot?.lotImageDtoList?.map((image, index) => (
                            <Grid item xs={6} md={4} key={index}>
                                <CardMedia
                                    component="img"
                                    image={image.imageUrl}
                                    alt={`All Image ${index}`}
                                    onClick={() => {
                                        setSelectedImageIndex(index);
                                        setOpenFullscreenModal(true);
                                        setOpenAllImagesModal(false);
                                    }}
                                    sx={{ cursor: 'pointer' }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAllImagesModal(false)}>Close</Button>
                </DialogActions>
            </Dialog >

            {/* Fullscreen Modal */}
            <Dialog
                PaperProps={{
                    sx: {
                        backgroundColor: 'transparent',
                        // boxShadow: 'none',
                    }
                }}
                open={openFullscreenModal} onClose={() => setOpenFullscreenModal(false)} fullScreen
            >
                <Box sx={{
                    position: 'relative',
                    height: '100vh',
                    bgcolor: 'rgba(0, 0, 0, 0.5)' // Set a semi-transparent black background
                }}
                >
                    <CardMedia
                        component="img"
                        image={lot?.lotImageDtoList?.[selectedImageIndex]?.imageUrl}
                        alt={`Fullscreen Image ${selectedImageIndex}`}
                        sx={{ height: '100%', width: '100%', objectFit: 'contain' }}
                    />
                    <IconButton
                        onClick={handlePrevImage}
                        sx={{ position: 'absolute', top: '50%', left: '10px', bgcolor: '#00000059', color: "#fff" }}
                    >
                        <ChevronLeft />
                    </IconButton>
                    <IconButton
                        onClick={handleNextImage}
                        sx={{ position: 'absolute', top: '50%', right: '10px', bgcolor: '#00000059', color: "#fff" }}
                    >
                        <ChevronRight />
                    </IconButton>
                    <IconButton
                        onClick={() => setOpenFullscreenModal(false)}
                        sx={{ position: 'absolute', top: '20px', right: '20px', bgcolor: '#00000059', color: "#fff" }}
                        className='bg-[#00000059]'
                    >
                        <Close />
                    </IconButton>
                </Box>
            </Dialog >
        </div >
    );
}
