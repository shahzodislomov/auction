"use client"
import { getStorageItem } from "@/utils/storage";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import { CircularProgress, Button, Typography, Divider, CardMedia, Grid, Box, Modal, Breadcrumbs, IconButton, Card, CardContent } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useBidsByLot, useHighestBid } from "@/queries/bid";
import { useLot, useLotCounts } from "@/queries/lots";
import { api } from "@/api/api";
import { toast } from "react-toastify";
import { Add, ArrowLeft, ArrowRight, AttachMoney, Close, EmojiEvents, Gavel, Percent, Person, PlayArrow, ShowChart } from "@mui/icons-material";
import { useUserById } from "@/queries/users";
import { useSocket } from "@/hooks/useStomp";
import { useQueryClient } from "@tanstack/react-query";
import useCountdown from "@/hooks/countdowns";
import useAuthRedirect from '@/hooks/authRedirect'

export default function AuctionBiddingPage() {
  const { id: auctionId } = useParams();
  const userId = parseInt(getStorageItem('userId'));
  const [bidAmount, setBidAmount] = useState("");
  const [latestBid, setLatestBid] = useState(null);
  const [lotCountsData, setLotCountsData] = useState(null);
  const [allbids, setAllBids] = useState([]);
  const [auction, setAuction] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(0); // Pagination: current page
  const [pageSize] = useState(10); // Pagination: number of bids per page
  const stompClient = useSocket();
  const router = useRouter();
  const [totalBidsCount, setTotalBidsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intl = useIntl()

  const [targetTime, setTargetTime] = useState(null);
  const [timeMessage, setTimeMessage] = useState("");
  const timeLeft = useCountdown(targetTime);

  const owner = Number(auction?.sellerId);
  const { data: ownerDetailsData } = useUserById(owner);
  const queryClient = useQueryClient();

  const ownerDetails = ownerDetailsData?.data || "";
  useAuthRedirect()

  useEffect(() => {
    if (stompClient && stompClient.connected) {
      const subscription = stompClient.subscribe(`/topic/bids/getHighestBid/${auctionId}`, (message) => {
        const rawData = JSON.parse(message.body);
        // console.log("Received message:", rawData);

        const responseData = rawData.data || rawData; // Use data if it exists, otherwise use rawData itself

        if (!responseData) {
          console.error("Invalid data format:", rawData);
          return;
        }

        const newBid = Array.isArray(responseData) ? responseData[responseData.length - 1] : responseData;
        setLatestBid(newBid); // Store only the latest bid
      });

      stompClient.publish({
        destination: `/app/bids/getHighestBid/${auctionId}`,

      });

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [stompClient, auctionId]);

  useEffect(() => {
    if (stompClient && stompClient.connected) {
      const subscription = stompClient.subscribe("/topic/lots/getLotCounts", (message) => {
        const rawData = JSON.parse(message.body);
        // console.log("Received message:", rawData);

        const responseData = rawData.data || rawData; // Use data if it exists, otherwise use rawData itself

        if (!responseData) {
          console.error("Invalid data format:", rawData);
          return;
        }

        const newCounts = Array.isArray(responseData) ? responseData[responseData.length - 1] : responseData;
        setLotCountsData(newCounts); // Store only the latest bid
      });

      stompClient.publish({
        destination: "/app/lots/getLotCounts",
        body: JSON.stringify({ id: auctionId }),
      });

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [stompClient, auctionId]);

  useEffect(() => {
    if (stompClient && stompClient.connected) {
      const subscription = stompClient.subscribe(`/topic/bids/getAllBidsByAuctionId/${auctionId}`, (message) => {
        const rawData = JSON.parse(message.body);
        // console.log("Received WebSocket data:", rawData);

        // Reset the bids list for each page, so it doesn't accumulate over multiple page updates
        const bidsArray = rawData.data ? rawData.data : rawData;
        setAllBids(bidsArray);  // Replace old bids with new ones
        setTotalBidsCount(bidsArray.length || 0);
      });

      stompClient.publish({
        destination: `/app/bids/getAllBidsByAuctionId/${auctionId}`,
        body: JSON.stringify({
          // id: lotId,  // Lot ID to fetch bids for
        }),
      });

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [stompClient, auctionId]);

  useEffect(() => {
    if (stompClient && stompClient.connected) {
      const subscription = stompClient.subscribe(`/topic/lots/${auctionId}`, (message) => {
        const rawData = JSON.parse(message.body);
        // console.log("Received message:", rawData);
        // console.log(lotId);

        const responseData = rawData.data || rawData; // Use data if it exists, otherwise use rawData itself

        if (!responseData) {
          console.error("Invalid data format:", rawData);
          return;
        }

        const newData = Array.isArray(responseData) ? responseData[responseData.length - 1] : responseData;
        setLot(newData); // Store only the latest bid
      });

      stompClient.publish({
        destination: `/app/lots/${auctionId}`,
        // body: JSON.stringify({ id: lotId }),
      });

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [stompClient, auctionId]);

  // useEffect(() => {
  //   refetch(); // Trigger refetch of bid data when necessary
  // }, [page, bidAmount]); // Depending on dependencies, e.g., page change, bid placed

  // Set the bids on initial load
  useEffect(() => {
    if (latestBid) {
      if (lot.incrementType === "FIXED") {
        if (latestBid.bidAmount) {
          setBidAmount(latestBid.bidAmount + lot.incrementValue);
        }
      } else if (lot.incrementType === "PERCENTAGE") {
        setBidAmount(latestBid.bidAmount + (lot.currentPrice * lot.incrementValue) / 100)
      }
    } else if (lot || latestBid?.status === "NO_CONTENT") {
      if (lot.incrementType === "FIXED") {
        setBidAmount(lot.startPrice + lot.incrementValue); // First bid case
      } else {
        setBidAmount(lot.startPrice + (lot.startPrice * lot.incrementValue) / 100)
      }
    }
    // else {
    //   toast.error("error")
    // }

  }, [latestBid, lot]);

  useEffect(() => {
    if (!lot) return;

    if (lot.lotStatus === "PENDING") {
      setTargetTime(lot.startTime);
      setTimeMessage("Boshlanishiga qoldi")
    } else if (lot.lotStatus === "ACTIVE") {
      const baseEnd = lot.endTime ? new Date(lot.endTime).getTime() : NaN;
      if (!latestBid?.bidAmount) {
        setTimeMessage("Tugashiga qoldi");
        setTargetTime(lot.endTime);
      } else {
        const lastBidTime = latestBid.bidTime ? new Date(latestBid.bidTime).getTime() : Date.now();
        const currentTargetMs = targetTime ? new Date(targetTime).getTime() : baseEnd;
        const remainingToCurrentEnd = currentTargetMs - lastBidTime;

        // Anti-snipping: tugashiga 2 minut qolganda yangi bid kelsa tugash vaqtiga +5 minut qo'shiladi
        if (remainingToCurrentEnd > 0 && remainingToCurrentEnd <= 2 * 60 * 1000) {
          setTimeMessage("Anti-snipping: auksion 5 daqiqaga uzaytirildi");
          setTargetTime(new Date(currentTargetMs + 5 * 60 * 1000).toISOString());
        } else if (!targetTime && Number.isFinite(baseEnd)) {
          setTimeMessage("Tugashiga qoldi");
          setTargetTime(lot.endTime);
        }
      }
    }
  }, [lot, latestBid]);


  // if (lotLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-40">
  //       <CircularProgress />
  //     </div>
  //   );
  // }

  const handlePlaceBid = async () => {
    // if (!bidAmount || (latestBid?.bidAmount && Number(bidAmount) <= latestBid.bidAmount)) return;

    const bidderId = getStorageItem("userId");
    if (!bidderId) {
      alert("Please log in to place a bid");
      return;
    }

    try {
      const res = await api.post(`/bids/create?bidderId=${bidderId}&auctionId=${auctionId}`, {
        bidAmount: parseFloat(bidAmount),
      });

      if (res.data.status === "OK") {
        toast.info(res.data.message);
        setBidAmount("");
        setOpenModal(false);
        const currentTargetMs = targetTime ? new Date(targetTime).getTime() : (lot.endTime ? new Date(lot.endTime).getTime() : NaN);
        const remainingToCurrentEnd = currentTargetMs - Date.now();
        if (remainingToCurrentEnd > 0 && remainingToCurrentEnd <= 2 * 60 * 1000) {
          setTimeMessage("Anti-snipping: auksion 5 daqiqaga uzaytirildi");
          setTargetTime(new Date(currentTargetMs + 5 * 60 * 1000).toISOString());
        }
        // refetch()
        // queryClient.refetchQueries(['bidsByLot', lotId]);
        // queryClient.refetchQueries(['highestBid', lotId]);
        // reBidsByLot();
        // reHighest();
        // stompClient.publish({
        //   // body: JSON.stringify({ id: lotId })
        // });
      } else if (res.data.status === "BAD_REQUEST") {
        toast.info(res.data.message);
      } else if (res.data.status === "NOT_FOUND") {
        toast.error(res.data.message)
      }

    } catch (error) {
      console.error("Error placing bid:", error);
    } finally {
      setLoading(false);  // Set loading state back to false
    }
  };

  // console.log(loading);

  // Sort bids from latest to oldest and remove the latest bid
  const sortedBids = allbids
    ?.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime)) // Sort by date (latest first)
    ?.filter(bid => bid.id !== latestBid?.id); // Remove latest bid

  // Pagination logic after sorting and filtering
  const currentPageBids = sortedBids?.slice(page * pageSize, (page + 1) * pageSize);

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if ((page + 1) * pageSize < totalBidsCount) setPage(page + 1);
  };

  // console.log(lotCountsData);

  // const nextBid = latestBid
  //   ? lot.incrementType === "FIXED"
  //     ? latestBid.bidAmount + lot.incrementValue
  //     : latestBid.bidAmount + (latestBid.bidAmount * lot.incrementValue) / 100
  //   : lot.incrementType === "FIXED"
  //     ? lot.startPrice + lot.incrementValue
  //     : lot.startPrice + (lot.startPrice * lot.incrementValue) / 100;

  // For percentage increment

  return (
    <Box sx={{ py: 3, px: { xs: 2, md: 4, lg: 6 }, mt: '64px' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <NextLink underline="hover" color="inherit" href="/">
          <FormattedMessage id="Home" />
        </NextLink>
        <NextLink underline="hover" color="inherit" href="/dashboard">
          <FormattedMessage id="Dashboard" />
        </NextLink>
        <NextLink underline="hover" color="inherit" href="/dashboard/my-auctions">
          <FormattedMessage id="Myauctions" />
        </NextLink>
        <Typography sx={{ color: "text.primary", cursor: "pointer" }}>{lot?.title}</Typography>
      </Breadcrumbs>

      <Grid container>
        {/* Left: Lot Information */}
        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={4}
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              transition: "transform 0.2s ease-in-out",
              "&:hover": { transform: "scale(1.03)" },
            }}
          >
            {/* Lot Image */}
            <CardMedia
              component="img"
              height="220"
              image={lot?.lotImageDtoList?.[0]?.imageUrl || "/placeholder.jpg"}
              alt={lot.title}
              sx={{ objectFit: "cover", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            />

            {/* Lot Details */}
            <CardContent>
              {/* Lot Title */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {lot.title}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Price & Increment */}
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PlayArrow color="primary" />
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {lot?.startPrice?.toLocaleString()} UZS
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <ShowChart color="primary" />
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {lot?.incrementValue?.toLocaleString()}
                    {lot?.incrementType === "FIXED" ? " UZS" : ""}
                    {lot?.incrementType === "PERCENTAGE" && <Percent color="primary" fontSize="inherit" />}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Owner Details */}
              <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                <Typography variant="body2" fontWeight="500">
                  <FormattedMessage id="owner" defaultMessage="Ega" />:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {ownerDetails?.secretName || "Anonym"}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* View Lot Button */}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  borderRadius: 2,
                  fontWeight: "bold",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.03)", boxShadow: 4 },
                }}
                onClick={() => router.push(`/auctions/${auctionId}`)}
              >
                <FormattedMessage id="tolotcard" defaultMessage="Lot kartasiga o'tish" />
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Center: Bidding Area */}
        <Grid item xs={12} md={6} lg={6} className="p-4 rounded-t-lg shadow relative h-full">
          {/* Latest Bid Section */}
          {latestBid ? (
            <div className={`${timeLeft === 'Ended' ? 'bg-success' : `bg-primary`} rounded-md text-white px-2 py-4 flex justify-between items-center mb-2`}>
              <div className="flex items-center gap-2">
                <Gavel fontSize="large" className="bg-white text-primary rounded-full p-1" />
                <div>
                  {timeLeft === 'Ended' ? intl.formatMessage({ id: 'winningbid' }) : intl.formatMessage({ id: 'lastbid' })}
                </div>
              </div>
              {latestBid?.bidderDto?.id === userId ? "Men" : (
                <div>{[latestBid?.bidderDto?.firstName || latestBid?.bidderDto?.firstname, latestBid?.bidderDto?.lastName || latestBid?.bidderDto?.lastname].filter(Boolean).join(" ") || latestBid?.bidderDto?.secretName || latestBid?.bidderDto?.username || latestBid?.bidderDto?.id}</div>
              )}
              <div className="bg-white text-primary rounded-md px-4 flex items-center">{latestBid?.bidAmount?.toLocaleString()} UZS</div>
            </div>
          ) : (
            <div className="text-center">
              <FormattedMessage id="nobids" />
            </div>
          )}

          {currentPageBids.length > 0 && (
            <div className="flex flex-col flex-grow">
              <div className="space-y-2 flex-grow min-h-[200px]">
                {currentPageBids.length > 0 && (
                  currentPageBids.map((bid) => (
                    <div key={bid.id} className="px-2 py-1 bg-gray-100 rounded-lg shadow-sm flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Gavel fontSize="large" className="bg-white text-primary rounded-full p-1" />
                        <div><FormattedMessage id="prevbid" /></div>
                      </div>
                      {/* <div className="bg-primary-light rounded-md px-1 py-[2px] text-white"> */}

                      {/* {bid?.bidderDto?.id === userId ? intl.formatMessage({ id: 'me' }) : (
                        <div>{bid?.bidderDto?.secretName || bid?.bidderDto?.id}</div>
                      )} */}
                      {bid?.bidderDto?.id === userId ? intl.formatMessage({ id: 'me' }) : (
                        <div>
                          {[bid?.bidderDto?.firstName || bid?.bidderDto?.firstname, bid?.bidderDto?.lastName || bid?.bidderDto?.lastname].filter(Boolean).join(" ") || bid?.bidderDto?.secretName || bid?.bidderDto?.username || bid?.bidderDto?.id}
                        </div>
                      )}
                      {/* </div> */}
                      <div className="bg-white text-primary rounded-md px-4 flex items-center">{bid?.bidAmount?.toLocaleString()} UZS</div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-center items-center mt-4">
                <Button onClick={handlePrevPage} disabled={page === 0}>
                  <ArrowLeft />
                </Button>
                <div className="bg-primary rounded-md px-2 py-1 text-white">
                  {page + 1}
                </div>
                <Button onClick={handleNextPage} disabled={(page + 1) * pageSize >= totalBidsCount}>
                  <ArrowRight />
                </Button>
              </div>
            </div>
          )}
        </Grid>


        {/* Right: Bid Recommendations */}
        <Grid item xs={12} md={6} lg={3} className=" rounded-lg p-4 space-y-2">
          {timeLeft === "Ended" ? (
            <div className="ml-2 text-[20px]"><FormattedMessage id="auctended" /></div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="ml-2 text-[20px]">{timeMessage}</div>
              <div className="timerComp">
                <Box className="flex flex-col items-center">
                  <div className="text-primary text-[32px] font-bold">{timeLeft.days}</div>
                  <div className="text-[14px]">
                    <FormattedMessage id='day' defaultMessage='Kun' />
                  </div>
                </Box>
                <div className="text-[2em] text-primary-light">:</div> {/* Colon outside */}
                <Box className="flex flex-col items-center">
                  <div className="text-primary text-[32px] font-bold">{timeLeft.hours}</div>
                  <div className="text-[14px]">
                    <FormattedMessage id='hour' defaultMessage='Soat' />
                  </div>
                </Box>
                <div className="text-[2em] text-primary-light">:</div> {/* Colon outside */}
                <Box className="flex flex-col items-center">
                  <div className="text-primary text-[32px] font-bold">{timeLeft.minutes}</div>
                  <div className="text-[14px]">
                    <FormattedMessage id='minute' defaultMessage='Daqiqa' />
                  </div>
                </Box>
                <div className="text-[2em] text-primary-light">:</div> {/* Colon outside */}
                <Box className="flex flex-col items-center">
                  <div className="text-primary text-[32px] font-bold">{timeLeft.seconds}</div>
                  <div className="text-[14px]">
                    <FormattedMessage id='second' defaultMessage='Soniya' />
                  </div>
                </Box>
              </div>

            </div>
          )}
          <div className="p-2 bg-gray-50 rounded-lg shadow-sm flex items-center text-primary">
            <Person fontSize="small" />
            <FormattedMessage id="participants" defaultMessage="Qatnashuvchilar" />: {lotCountsData?.depositCount}
          </div>
          <div className="p-2 bg-gray-50 rounded-lg shadow-sm flex items-center text-primary">
            <Gavel fontSize="small" />
            <FormattedMessage id="allbids" defaultMessage="Umumiy takliflar" />: {lotCountsData?.bidCount}
          </div>
          <div className="p-2 bg-gray-50 rounded-lg shadow-sm flex items-center text-primary">
            <Gavel fontSize="small" />
            <FormattedMessage id="alllikes" defaultMessage="Umumiy likelar" />: {lotCountsData?.likeCount}
          </div>
          <Divider />
          <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
            {/* Latest Bid Info */}
            <div className="flex items-center bg-gray-100 p-3 rounded-lg shadow-sm border-l-4 border-primary">
              <EmojiEvents className="text-yellow-500 text-3xl mr-3" />
              <div className="text-gray-700">
                {lot?.lotStatus === "PENDING" ? (
                  <p className="text-lg font-semibold">
                    <FormattedMessage id="nolatestBid" defaultMessage="Birinchi taklifni bering" />:{" "}
                    <span className="text-primary">{bidAmount?.toLocaleString()} UZS</span>
                  </p>
                ) : latestBid?.bidAmount ? (
                  <p className="text-lg font-semibold">
                    <FormattedMessage id="lastbid" defaultMessage="Oxirgi taklif" />:{" "}
                    <span className="text-primary">{latestBid?.bidAmount?.toLocaleString()} UZS</span>
                  </p>
                ) : (
                  <p className="text-lg font-semibold">
                    <FormattedMessage id="nolatestBid" defaultMessage="Birinchi taklifni bering" />
                  </p>
                )}
              </div>
            </div>

            {/* Bid Button */}
            {lot?.lotStatus === "ACTIVE" && (
              <button
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl text-lg font-semibold shadow-md transition-all hover:bg-primary-dark active:scale-95"
                onClick={() => setOpenModal(true)}
              >
                <Gavel className="text-white text-2xl" />
                <FormattedMessage id="placeBid" defaultMessage="Taklif berish" />
              </button>
            )}
          </div>
        </Grid>
      </Grid>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px 32px",
            boxShadow: 24,
            width: { xs: "90%", md: "45%" },
          }}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-3">
            <Typography variant="h6" fontWeight="bold">
              <FormattedMessage id="placeBid" defaultMessage="Narx taklif qilish" />
            </Typography>
            <IconButton onClick={() => setOpenModal(false)}>
              <Close />
            </IconButton>
          </div>

          <Divider sx={{ my: 2 }} />
          {/* Bid Details */}
          <Card elevation={3} sx={{ borderRadius: 3, boxShadow: 2, p: 2, mb: 2 }}>
            <CardContent>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {/* Current Bid */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" color="textSecondary">
                    <FormattedMessage id="lastbid" defaultMessage="Joriy taklif" />
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {latestBid?.bidAmount?.toLocaleString() || 0} UZS
                  </Typography>
                </Box>

                {/* Increment Value */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" color="textSecondary">
                    <FormattedMessage id="bidincr" defaultMessage="Taklif oshishi" />
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary" display="flex" alignItems="center">
                    {lot?.incrementValue?.toLocaleString()}
                    {lot?.incrementType === "FIXED" && " UZS"}
                    {lot?.incrementType === "PERCENTAGE" && <Percent fontSize="small" sx={{ ml: 0.5 }} />}
                  </Typography>
                </Box>

                {/* Recommended Bid */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" color="textSecondary">
                    <FormattedMessage id="submitbid" defaultMessage="Taklif qilish narxi" />
                  </Typography>
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl text-lg font-semibold shadow-md transition-all">
                    <Gavel className="text-white text-2xl" />
                    {bidAmount?.toLocaleString()} UZS
                  </div>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Place Bid Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              padding: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "8px",
              mt: 2,
              transition: "0.3s",
              "&:hover": { backgroundColor: "primary.dark" },
            }}
            onClick={handlePlaceBid}
          >
            <FormattedMessage id="confirm" defaultMessage="Tasdiqlash" />
          </Button>
        </Box>
      </Modal>
    </Box >
  );
}
