"use client"
import { getStorageItem } from "@/utils/storage";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Box,
    Typography,
    Card,
    CardMedia,
    Button,
    Grid,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    CardContent,
    Breadcrumbs,
    Chip,
    CardHeader,
    Avatar,
    Modal,
} from '@mui/material';
import {
    AlarmOff, AlarmOn, ArrowDropDown, ArrowDropUp, AttachMoney, Category, ChevronLeft,
    ChevronRight, Close, Favorite, FavoriteBorder, FlareSharp, FmdGood, Info, MonetizationOn,
    People, Percent, Person, PriceCheck, Sell, Tag, ViewAgenda, Visibility
} from '@mui/icons-material';
import { useLikeLotMutation, useLikedLots, useLot, useLotCounts } from '@/queries/lots';
import Loader from '@/components/Loader';
import { toast } from 'react-toastify';
import { useDepositToLotMutation } from '@/queries/deposit';
import { FormattedMessage, useIntl } from 'react-intl';
import { useUserById, useUserDeposits } from '@/queries/users';
import dayjs from 'dayjs';
import { api } from '@/api/api';
import { useQueryClient } from "@tanstack/react-query";
import useCountdown from '@/hooks/countdowns';
import placeholderImg from '@/assets/placeholder-image.webp'
import { useSocket } from '@/hooks/useStomp';
import LoginModal from '@/app/(_components)/auth/LoginModal';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import CommentSection from '../Comments';
import { useUserContext } from '@/context/UserContext';

export default function LotDetail() {
    const { id } = useParams();
    const router = useRouter();
    const stompClient = useSocket();
    const [lotCountsData, setLotCountsData] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [openFullscreenModal, setOpenFullscreenModal] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [depositMade, setDepositMade] = useState(false);
    const [targetTime, setTargetTime] = useState(null);
    const [timeMessage, setTimeMessage] = useState("");
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [lot, setLot] = useState([]);
    const timeLeft = useCountdown(targetTime);
    const intl = useIntl()
    const queryClient = useQueryClient();
    const MySwal = withReactContent(Swal);

    // const { data: lot, isLoading, error } = useLot(id);
    const { mutate: likeLot } = useLikeLotMutation();
    const { mutate: depositToLot } = useDepositToLotMutation();
    const userId = Number(getStorageItem("userId"));
    const owner = Number(lot?.sellerId);
    const isOwner = userId ? userId === owner : false;
    const lotId = parseInt(id);


    const { data: ownerDetailsData } = useUserById(owner);
    const { data: checkDepoData } = useUserDeposits(userId);
    const { user } = useUserContext();

    const ownerDetails = ownerDetailsData?.data || "";

    // Fetch liked lots when the component first loads
    const { data: likedLotsData } = useLikedLots(userId);


    const modalRef = useRef(null);
    const thumbnailContainerRef = useRef(null);

    useEffect(() => {
        const viewLot = async () => {
            try {
                const response = await api.post(`/rec/viewLot?lotId=${id}&userId=${userId}`);
            } catch (error) {
                // console.error('Error:', error);
            }
        };

        viewLot();
    }, [lotId, userId]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSelectedImageIndex((prevIndex) =>
                lot?.lotImageDtoList?.length
                    ? (prevIndex + 1) % lot.lotImageDtoList.length
                    : 0
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [lot?.lotImageDtoList]);

    useEffect(() => {
        if (stompClient && stompClient.connected) {
            const subscription = stompClient.subscribe("/topic/lots/getLotCounts", (message) => {
                const rawData = JSON.parse(message.body);
                // console.log("Received message:", rawData);

                const responseData = rawData.data || rawData; // Use data if it exists, otherwise use rawData itself

                if (!responseData) {
                    // console.error("Invalid data format:", rawData);
                    return;
                }

                const newCounts = Array.isArray(responseData) ? responseData[responseData.length - 1] : responseData;
                setLotCountsData(newCounts); // Store only the latest bid
            });

            stompClient.publish({
                destination: "/app/lots/getLotCounts",
                body: JSON.stringify({ id: lotId }),
            });

            return () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            };
        }
    }, [stompClient, lotId]);

    useEffect(() => {
        if (stompClient && stompClient.connected) {
            const subscription = stompClient.subscribe(`/topic/lots/${lotId}`, (message) => {
                const rawData = JSON.parse(message.body);
                // console.log("Received message:", rawData);

                const responseData = rawData.data || rawData; // Use data if it exists, otherwise use rawData itself

                if (!responseData) {
                    // console.error("Invalid data format:", rawData);
                    return;
                }

                const newData = Array.isArray(responseData) ? responseData[responseData.length - 1] : responseData;
                setLot(newData); // Store only the latest bid
            });

            stompClient.publish({
                destination: `/app/lots/${lotId}`,
                // body: JSON.stringify({ id: lotId }),
            });

            return () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            };
        }
    }, [stompClient, lotId]);

    const handleNextImage = useCallback(() => {
        setSelectedImageIndex((prevIndex) =>
            prevIndex < lot?.lotImageDtoList.length - 1 ? prevIndex + 1 : 0
        );
    }, [lot]);

    const handlePrevImage = useCallback(() => {
        setSelectedImageIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : lot?.lotImageDtoList.length - 1
        );
    }, [lot]);

    useEffect(() => {
        if (!openFullscreenModal) return;

        const handleKeyPress = (event) => {
            if (event.key === "ArrowRight") handleNextImage();
            if (event.key === "ArrowLeft") handlePrevImage();
            if (event.key === "Escape") setOpenFullscreenModal(false);
        };

        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, [openFullscreenModal, handleNextImage, handlePrevImage]);

    const handleImageClick = (index) => {
        if (index === selectedImageIndex) {
            setOpenFullscreenModal(true);
        } else {
            setSelectedImageIndex(index);
        }
    };

    const scrollThumbnails = (direction) => {
        const container = thumbnailContainerRef.current;
        if (container) {
            if (direction === "up") {
                container.scrollBy({ top: -100, behavior: "smooth" });
            } else {
                container.scrollBy({ top: 100, behavior: "smooth" });
            }
        }
    };

    const calculateThumbnailHeight = () => {
        const totalThumbnails = lot?.lotImageDtoList?.length;
        return totalThumbnails <= 4 ? `${55 / totalThumbnails}vh` : "auto";
    };


    const handleModalClick = (event) => {
        if (modalRef.current && event.target === modalRef.current) {
            setOpenFullscreenModal(false);
        }
    };

    useEffect(() => {
        if (!lot) return;

        if (lot.lotStatus === "PENDING") {
            setTargetTime(lot.startTime);
            setTimeMessage("Boshlanishiga qoldi")
        } else if (lot.lotStatus === "ACTIVE") {
            setTimeMessage("Tugashiga qoldi")
            setTargetTime(lot.endTime);
        }
    }, [lot]);

    // Function to parse and localize the name
    const getLocalizedName = (name) => {
        try {
            const parsedName = name;
            return parsedName[intl.locale] || parsedName.en || "Unknown";
        } catch (error) {
            return "Unknown";
        }
    };

    const handleCategoryClick = (type) => {
        try {
            const parsedName = type.lotType.name;
            const englishName = parsedName.en || "unknown"; // Always use English in URLs
            router.push(`/auctions?lotType=${encodeURIComponent(englishName)}`);
        } catch (error) {
            console.error("Error parsing lot type name:", error);
        }
    };

    useEffect(() => {
        if (userId) {
            if (likedLotsData) {
                const likedIds = likedLotsData?.map((lot) => lot?.id);
                setIsLiked(likedIds?.includes(lotId));
            }

            if (checkDepoData) {
                if (depositMade === false) {
                    const deposits = Array.isArray(checkDepoData)
                        ? checkDepoData
                        : checkDepoData?.contents ?? checkDepoData?.content ?? [];
                    const depositedLotIds = deposits.map(
                        deposit => deposit.auctionId ?? deposit.lotId ?? deposit.id,
                    );
                    setDepositMade(depositedLotIds?.includes(lotId));
                }
            }
        }
    }, [userId, likedLotsData, checkDepoData, lotId, depositMade]);



    const handleLike = () => {
        const userId = getStorageItem("userId");
        if (!user) {
            setLoginModalOpen(true);
            return;
        }

        const previousState = isLiked;
        setIsLiked(!previousState); // Instant 0ms optimistic update

        likeLot(
            { userId: parseInt(userId), lotId: parseInt(id), isLiked: previousState },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries("lotCounts");
                    queryClient.invalidateQueries("like");
                },
                onError: () => {
                    setIsLiked(previousState);
                    toast.error("Error liking the lot");
                },
            }
        );
    };

    const handleParticipate = () => {
        const userId = getStorageItem("userId");
        const depositAmount = (lot.startPrice * 0.01).toLocaleString();

        if (!user) {
            setLoginModalOpen(true);
            return;
        }

        if (!userId) {
            toast.error("User ID not found. Please log in again.");
            return;
        }

        MySwal.fire({
            title: intl.formatMessage({ id: "confirm_deposit" }),
            text: intl.formatMessage({ id: "confirm_deposit_text" }, { amount: depositAmount }),
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: "continue" }),
            cancelButtonText: intl.formatMessage({ id: "cancel" }),
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                depositToLot(
                    { userId: parseInt(userId), lotId: parseInt(id) },
                    {
                        onSuccess: (response) => {
                            if (response.status === "BAD_REQUEST") {
                                toast.error(response.message);
                            } else if (response.status === "OK") {
                                setDepositMade(true);
                                MySwal.fire(
                                    intl.formatMessage({ id: "success" }),
                                    intl.formatMessage({ id: "participated" }),
                                    "success"
                                );
                            }
                        },
                        onError: () => {
                            toast.error("Participation failed");
                            MySwal.fire(
                                intl.formatMessage({ id: "error" }),
                                intl.formatMessage({ id: "unexpected_error" }),
                                "error"
                            );
                        },
                    }
                );
            }
        });
    };

    const handleLoginSuccess = (loggedInUserId) => {
        // After login, retry the last action
        if (!isLiked) {
            handleLike();
        } else {
            handleParticipate();
        }
    };

    // if (isLoading) return <Loader />;
    // if (error) return <Typography>Error loading lot details</Typography>;

    return (
        <Box sx={{ py: 3, px: { xs: 2, md: 4, lg: 6 }, mt: '64px' }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                <Link underline="hover" color="inherit" href="/">
                    <FormattedMessage id='Home' />
                </Link>
                <Link underline="hover" color="inherit" href="/auctions">
                    <FormattedMessage id='Auctions' />
                </Link>
                {/* <Typography onClick={() => handleCategoryClick(lot)} sx={{ color: 'inherit', cursor: 'pointer' }}>{getLocalizedName(lot?.lotType?.name)}</Typography> */}
                {/* <Typography onClick={() => handleCategoryClick(lot)} sx={{ color: 'inherit', cursor: 'pointer' }}>{JSON.parse(lot?.subcategories)}</Typography> */}
                <Typography sx={{ color: 'text.primary', cursor: 'pointer' }}>№{` ${lot?.id}`}</Typography>
            </Breadcrumbs>
            <Grid container spacing={4}>
                {/* Left: Images */}
                <Grid item xs={12} md={7}>
                    <div className="flex gap-4 justify-center items-cente relative">
                        {/* Thumbnails with Scroll Buttons */}
                        <div className="relative hidden md:flex flex-col items-center justify-start text-[#]">
                            {/* Scroll Up Button */}
                            {lot?.lotImageDtoList?.length > 4 && (
                                <IconButton
                                    sx={{
                                        position: "absolute",
                                        top: "-10px",
                                        bgcolor: "#71717159",
                                        ":hover": {
                                            bgcolor: '#3d3d3d59',
                                        },
                                        color: "#fff",
                                    }}
                                    onClick={() => scrollThumbnails("up")}
                                >
                                    <ArrowDropUp fontSize='small' />
                                </IconButton>
                            )}

                            {/* Thumbnail Container */}
                            <div
                                ref={thumbnailContainerRef}
                                id="thumbnail-container"
                                className="flex flex-col gap-1  overflow-y-auto scrollbar-hidden"
                                style={{
                                    maxHeight: '55vh', // Ensuring it doesn't exceed this height
                                }}
                            >
                                {lot?.lotImageDtoList?.map((image, index) => (
                                    <CardMedia
                                        key={index}
                                        component="img"
                                        image={image.imageUrl}
                                        alt={`Thumbnail ${index}`}
                                        sx={{
                                            // width: "100px", // Fixed width for better control
                                            height: '13.3vh',
                                            objectFit: "cover",
                                            cursor: "pointer",
                                            borderRadius: "5px",
                                            border: selectedImageIndex === index ? "2px solid blue" : "1px solid #ddd",
                                        }}
                                        onClick={() => handleImageClick(index)}
                                    />
                                ))}
                            </div>

                            {/* Scroll Down Button */}
                            {lot?.lotImageDtoList?.length > 4 && (
                                <IconButton
                                    sx={{
                                        position: "absolute",
                                        bottom: "-10px",
                                        bgcolor: "#71717159",
                                        ":hover": {
                                            bgcolor: '#3d3d3d59',
                                        },
                                        color: "#fff",
                                    }}
                                    onClick={() => scrollThumbnails("down")}
                                >
                                    <ArrowDropDown fontSize='small' />
                                </IconButton>
                            )}
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 relative">
                            <IconButton
                                onClick={handlePrevImage}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "10px",
                                    bgcolor: "#71717159",
                                    ":hover": {
                                        bgcolor: '#3d3d3d59',
                                    },
                                    color: "#fff",
                                }}
                            >
                                <ChevronLeft />
                            </IconButton>
                            <CardMedia
                                component="img"
                                image={lot?.lotImageDtoList?.[selectedImageIndex]?.imageUrl || placeholderImg}
                                alt="Main Image"
                                sx={{
                                    height: { xs: 'auto', md: "55vh" },
                                    width: "100%",
                                    objectFit: "contain",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    objectFit: 'cover'
                                }}
                                onClick={() => handleImageClick(selectedImageIndex)}
                            />
                            <IconButton
                                onClick={handleNextImage}
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    right: "10px",
                                    bgcolor: "#71717159",
                                    ":hover": {
                                        bgcolor: '#3d3d3d59',
                                    },
                                    color: "#fff",
                                }}
                            >
                                <ChevronRight />
                            </IconButton>
                        </div>
                    </div>
                    <Divider sx={{ mt: 4, mb: 2 }} />
                    <div className="">
                        <div className="text-[18px] flex text-gray-500 items-center">
                            <FmdGood fontSize='small' color='primary' />
                            {lot?.region?.nameUz}{", "}
                            {lot?.district?.nameUz}
                        </div>
                        <div className="text-[30px]">
                            {lot?.title}
                        </div>
                        <div className="text-[14px] text-gray-500">
                            {lot?.description}
                        </div>
                    </div>
                </Grid>

                {/* Right: Lot Details */}

                <Grid item xs={12} md={5}>
                    <div className='border-2 border-t-primary'>
                        <CardContent>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    {timeLeft === "Ended" ? (
                                        <div className="ml-2 text-[20px]"><FormattedMessage id='auctended' /></div>
                                    ) : (
                                        <div className="flex flex-col items-center w-[350px] justify-center mx-auto">
                                            <div className="ml-2 text-[14px] md:text-[18px]">{timeMessage}</div>
                                            <div className="timerComp text-[10px] md:text-[14px]">
                                                <Box className="flex flex-col items-center">
                                                    <div className="text-primary text-[28px] font-bold">{timeLeft.days}</div>
                                                    <div>
                                                        <FormattedMessage id='day' defaultMessage='Kun' />
                                                    </div>
                                                </Box>
                                                <div className="text-[2em] text-primary-light">:</div> {/* Colon outside */}
                                                <Box className="flex flex-col items-center">
                                                    <div className="text-primary text-[28px] font-bold">{timeLeft.hours}</div>
                                                    <div>
                                                        <FormattedMessage id='Hour' defaultMessage='Soat' />
                                                    </div>
                                                </Box>
                                                <div className="text-[2em] text-primary-light">:</div> {/* Colon outside */}
                                                <Box className="flex flex-col items-center">
                                                    <div className="text-primary text-[28px] font-bold">{timeLeft.minutes}</div>
                                                    <div>
                                                        <FormattedMessage id='Minute' defaultMessage='Daqiqa' />
                                                    </div>
                                                </Box>
                                                <div className="text-[2em] text-primary-light">:</div> {/* Colon outside */}
                                                <Box className="flex flex-col items-center">
                                                    <div className="text-primary text-[28px] font-bold">{timeLeft.seconds}</div>
                                                    <div>
                                                        <FormattedMessage id='Second' defaultMessage='Soniya' />
                                                    </div>
                                                </Box>
                                            </div>

                                        </div>
                                    )}
                                    <Divider sx={{ my: 1 }} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: "center" }}>
                                        <MonetizationOn color='primary' fontSize='small' />
                                        <FormattedMessage id='startprice' defaultMessage="Boshlang'ich narx" />
                                    </Typography>
                                    <div className="flex items-center mt-2 p-2 gap-2">
                                        {/* <AttachMoney color='primary' /> */}
                                        <Typography fontSize={28} fontFamily='monospace'>{lot?.startPrice?.toLocaleString()}</Typography>
                                        UZS
                                    </div>
                                    <Divider sx={{ mt: 1 }} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: "center" }}>
                                        {lot?.incrementType === "PERCENTAGE" ? <Percent color='primary' /> : <PriceCheck color='primary' fontSize='small' />}
                                        <FormattedMessage id={`${intl.formatMessage({ id: 'inctype' })}`} />
                                        - {lot?.incrementType === "PERCENTAGE" ? intl.formatMessage({ id: 'percentage' }) : intl.formatMessage({ id: 'fixed' })}
                                    </Typography>
                                    <div className="flex items-center mt-2 p-2 gap-2">
                                        {/* {lot?.incrementType === "FIXED" && <AttachMoney color='primary' />} */}
                                        <Typography fontSize={28} fontFamily='monospace'>{lot?.incrementValue?.toLocaleString()}</Typography>
                                        {lot?.incrementType === "FIXED" && "UZS"}
                                        {lot?.incrementType === "PERCENTAGE" && <Percent color='primary' />}
                                    </div>
                                    <Divider sx={{ mt: 1 }} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: "center" }}>
                                        <AlarmOn color='primary' fontSize='small' />
                                        <FormattedMessage id='starttime' defaultMessage='Boshlanish vaqti' />
                                    </Typography>
                                    <div className="flex items-center mt-2 p-2">
                                        <Typography fontSize={15} fontWeight="bold" fontFamily="monospace">
                                            {lot?.startTime ? dayjs(lot?.startTime).format('DD MMM YYYY · h:mm A') : "—"}
                                        </Typography>
                                    </div>
                                    <Divider sx={{ mt: 1 }} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: "center" }}>
                                        <AlarmOff color='primary' fontSize='small' />
                                        <FormattedMessage id='endtime' defaultMessage='Tugash vaqti' />
                                    </Typography>
                                    <div className="flex items-center mt-2 p-2">
                                        <Typography fontSize={15} fontWeight="bold" fontFamily="monospace">
                                            {lot?.endTime ? dayjs(lot?.endTime).format('DD MMM YYYY · h:mm A') : "—"}
                                        </Typography>
                                    </div>
                                    <Divider sx={{ mt: 1 }} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        <FormattedMessage id="owner" defaultMessage="Ega" />
                                    </Typography>
                                    {/* <div className="bg-primary text-white mt-2 py-2 pl-[10px] pr-4 rounded-full inline-block cursor-pointer">
                                        <div className="flex items-center">
                                            <Person color="" />
                                            </div>
                                        </div> */}
                                    <div className="flex mt-2 py-2">
                                        <Tag color='primary' />
                                        <Typography ml={1}>{ownerDetails.secretName || "Anonym"}</Typography>
                                    </div>
                                    {/* <Divider sx={{ mt: 2 }} /> */}
                                </Grid>
                                {/* <Grid item xs={6}>
                                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        <FormattedMessage id="depositsCount" defaultMessage="Qatnashuvchilar" />
                                    </Typography>
                                    <div className="mt-2 py-2 cursor-pointer flex gap-3">
                                        <div className="flex items-center">
                                            <Favorite color="primary" />
                                            <Typography ml={1}>{lotCountsData?.likeCount}</Typography>
                                        </div>
                                        <div className="flex items-center">
                                            <People color="primary" />
                                            <Typography ml={1}>{lotCountsData?.depositCount}</Typography>
                                        </div>
                                        <div className="flex items-center">
                                            <Visibility color="primary" />
                                            <Typography ml={1}>{lotCountsData?.viewCount}</Typography>
                                        </div>
                                    </div>
                                    <Divider sx={{ mt: 2 }} />
                                </Grid> */}

                                {/* <Grid item xs={12}>
                                        <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)' }}><FormattedMessage id='description' defaultMessage="Tavsifi" /></Typography>
                                        <Typography className='items-center mt-2 p-2'><Info color='primary' /> {lot?.description || "Nomalum"}</Typography>
                                    </Grid> */}
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <div className="flex gap-1">
                                <div className="flex items-center border rounded-md">
                                    <IconButton onClick={handleLike} color="primary">
                                        {isLiked ? <Favorite /> : <FavoriteBorder />}
                                    </IconButton>
                                    {user &&
                                        <div className="text-[16px] text-primary pr-3">
                                            {lotCountsData?.likeCount}
                                        </div>
                                    }
                                </div>
                                {!isOwner && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleParticipate}
                                        disabled={depositMade || timeLeft === 'Ended' || user?.balance === 0}
                                        fullWidth
                                    >
                                        {depositMade ? <FormattedMessage id='deposited' defaultMessage='Qatnashdingiz' /> :
                                            user?.balance === 0 ? <FormattedMessage id='topupbalance' defaultMessage='Hisobingizni to`ldiring' /> :
                                                <FormattedMessage id='deposit' defaultMessage='Qatnashish' />}
                                    </Button>
                                )}
                                {isOwner && (
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => router.push('/dashboard/my-lots')}
                                        sx={{
                                            bgcolor: "#1E88E5"
                                        }}
                                    >
                                        <FormattedMessage id='manageLots' defaultMessage='Boshqarish' />
                                    </Button>
                                )}
                                {depositMade && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={() => router.push(`/lots/bidding/${lotId}`)}
                                    >
                                        <FormattedMessage id='watchLot' defaultMessage='Kuzatish' />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </div>
                </Grid >
                <Grid item xs={12}>
                    <Divider sx={{ mb: 4 }} />
                    <div className="mb-4 text-[22px] font-semibold"><FormattedMessage id='fulldet' /></div>
                    <Grid container spacing={3}>
                        {lot?.attributes &&
                            Object.entries(lot.attributes).map(([key, value], i) => (
                                <Grid item xs={3} key={i}>
                                    <div className="bg-gray-100 p-4 block space-y-2 rounded-md">
                                        <strong>{key}:</strong>
                                        <Divider />
                                        <div className="">{value}</div>
                                    </div>
                                </Grid>
                            ))}
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Divider sx={{ mb: 4 }} />
                    <div className="mb-4 text-[22px] font-semibold"><FormattedMessage id='reviews' /></div>
                    <Grid container spacing={3}>
                        <CommentSection lotId={id} userId={userId} lotSeller={lot?.sellerId} />
                    </Grid>
                </Grid>
            </Grid>


            <Modal open={isLoginModalOpen} onClose={() => setLoginModalOpen(false)}>
                <LoginModal
                    isOpen={isLoginModalOpen}
                    onClose={() => setLoginModalOpen(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            </Modal>
            {/* Fullscreen Modal */}
            <Dialog
                PaperProps={{
                    sx: { backgroundColor: "transparent" },
                }}
                open={openFullscreenModal}
                onClose={() => setOpenFullscreenModal(false)}
                fullScreen
            >
                <Box
                    ref={modalRef}
                    onClick={handleModalClick}
                    sx={{
                        position: "relative",
                        height: "100vh",
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <CardMedia
                        component="img"
                        image={lot?.lotImageDtoList?.[selectedImageIndex]?.imageUrl}
                        alt={`Fullscreen Image ${selectedImageIndex}`}
                        sx={{
                            maxWidth: "90vw",
                            maxHeight: "90vh",
                            objectFit: "contain",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <IconButton
                        onClick={handlePrevImage}
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "10px",
                            bgcolor: "#00000059",
                            color: "#fff",
                        }}
                    >
                        <ChevronLeft />
                    </IconButton>
                    <IconButton
                        onClick={handleNextImage}
                        sx={{
                            position: "absolute",
                            top: "50%",
                            right: "10px",
                            bgcolor: "#00000059",
                            color: "#fff",
                        }}
                    >
                        <ChevronRight />
                    </IconButton>
                    <IconButton
                        onClick={() => setOpenFullscreenModal(false)}
                        sx={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            bgcolor: "#00000059",
                            color: "#fff",
                        }}
                    >
                        <Close />
                    </IconButton>
                </Box>
            </Dialog>
        </Box >
    );
}
