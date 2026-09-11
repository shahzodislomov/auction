import { getStorageItem } from "@/utils/storage";
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Typography,
  Tooltip,
  IconButton,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AttachMoney, ShowChart, Favorite, FavoriteBorder, AccessTime, CheckCircle } from "@mui/icons-material";
import { useLikeLotMutation, useLikedLots, useLotCounts } from "@/queries/lots";
import { useQueryClient } from "@tanstack/react-query";
import { FormattedMessage, useIntl } from "react-intl";
import placeholderImg from '@/assets/placeholder-image.webp'
import dayjs from "dayjs";
import { ArrowUpRight, Calendar, Clock, Clock3, Users, Zap } from "lucide-react";
import { useUserById } from "@/queries/users";

const calculateRemainingTime = (targetTime) => {
  const now = new Date();
  const difference = new Date(targetTime) - now;
  if (difference <= 0) return "Ended";

  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
};

export default function LotCard({ lot }) {
  const [timer, setTimer] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const userId = getStorageItem("userId");
  const queryClient = useQueryClient();
    const router = useRouter();
  const intl = useIntl();
  const { refetch } = useLikedLots(userId)


  // Fetch liked lots when the component first loads
  const { data: likedLotsData } = useLikedLots(userId);
  const { data: seller } = useUserById(lot.sellerId)
  const { data: counts } = useLotCounts(lot.id);

  useEffect(() => {
    if (likedLotsData) {
      const likedIds = likedLotsData?.map((lot) => lot.id);
      setIsLiked(likedIds?.includes(lot.id));
    }
  }, [likedLotsData, lot.id]); // Depend on `likedLotsData` and `lot.id`

  // Mutation for liking/unliking
  const { mutate: likeLot, isLoading } = useLikeLotMutation();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now < new Date(lot.startTime)) {
        setTimer(`${intl.formatMessage({ id: "LotCardStarts", defaultMessage: "Boshlanadi" })}: ${calculateRemainingTime(lot.startTime)}`);
      } else if (now < new Date(lot.endTime)) {
        setTimer(`${intl.formatMessage({ id: "LotCardEnds", defaultMessage: "Tugaydi" })}: ${calculateRemainingTime(lot.endTime)}`);
      } else {
        setTimer(`${intl.formatMessage({ id: "LotCardEnded", defaultMessage: "Tugadi" })}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lot.startTime, lot.endTime, intl]);

  const handleLike = () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    const previousState = isLiked;
    setIsLiked(!previousState); // Optimistic update

    likeLot(
      { lotId: lot.id, userId, isLiked: previousState },
      {
        onSuccess: (data) => {
          const isLikedResponse =
            data?.liked === true ||
            (typeof data?.message === "string" && data.message.toLowerCase().includes("liked") && !data.message.toLowerCase().includes("unliked")) ||
            data?.status === "LIKED";
          const isUnlikedResponse =
            data?.liked === false ||
            data?.unliked === true ||
            (typeof data?.message === "string" && data.message.toLowerCase().includes("unliked")) ||
            data?.status === "UNLIKED";

          if (isLikedResponse) {
            setIsLiked(true);
          } else if (isUnlikedResponse) {
            setIsLiked(false);
          }
          refetch();
        },
        onError: () => {
          setIsLiked(previousState); // Rollback on error
        },
      }
    );
  };

  // Status badge styles
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ENDING_SOON':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status text in Uzbek
  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Faol';
      case 'PENDING':
        return 'Kutilmoqda';
      case 'ENDING_SOON':
        return 'Tez orada tugaydi';
      default:
        return status;
    }
  };

  // Status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Zap className="h-3 w-3" />;
      case 'PENDING':
        return <Calendar className="h-3 w-3" />;
      case 'ENDING_SOON':
        return <Clock3 className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    // <Card
    //   sx={{
    //     height: "100%",
    //     display: "flex",
    //     flexDirection: "column",
    //     boxShadow: 3,
    //     borderRadius: 2,
    //     transition: "transform 0.3s ease",
    //     "&:hover": { transform: "scale(1.01)" },
    //   }}
    // >
    //   <Link href={`/lots/${lot.id}`}>
    //     <CardMedia
    //       component="img"
    //       image={lot.lotImageDtoList?.[0]?.imageUrl || placeholderImg}
    //       alt={lot.title}
    //       sx={{ height: 180, borderRadius: "8px 8px 0 0" }}
    //     />
    //   </Link>
    //   <CardContent sx={{ flexGrow: 1 }}>
    //     <Link href={`/lots/${lot.id}`}>
    //       <Typography
    //         variant="h6"
    //         gutterBottom
    //         noWrap
    //         sx={{ fontWeight: "bold", color: "primary.main" }}
    //       >
    //         {lot.title}
    //       </Typography>
    //     </Link>
    //     <Typography
    //       variant="body2"
    //       color="text.secondary"
    //       sx={{
    //         overflow: "hidden",
    //         display: "-webkit-box",
    //         WebkitBoxOrient: "vertical",
    //         WebkitLineClamp: 3,
    //       }}
    //     >
    //       {lot.description || <FormattedMessage id="nodesc" />}
    //     </Typography>
    //     <Divider sx={{ my: 2 }} />
    //     <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
    //       <Chip
    //         label={lot.lotStatus}
    //         color={lot.lotStatus === "ACTIVE" ? "success" : "default"}
    //         size="small"
    //       />
    //       <Typography variant="body2" color="text.secondary">
    //         <strong>
    //           {(() => {
    //             try {
    //               const parsedName = lot.lotType.name;
    //               return parsedName[intl.locale] || parsedName.en || "Unknown";
    //             } catch (error) {
    //               return "Unknown";
    //             }
    //           })()}
    //         </strong>
    //       </Typography>


    //     </Box>
    //     <Box display="flex" justifyContent="space-between" alignItems="center">
    //       <Box display="flex" alignItems="center" gap={0.5}>
    //         <AttachMoney fontSize="small" />
    //         <Typography variant="body1">{lot.startPrice.toLocaleString()} UZS</Typography>
    //       </Box>
    //       <Box display="flex" alignItems="center" gap={0.5}>
    //         <ShowChart fontSize="small" />
    //         <Typography variant="body2" color="text.secondary">
    //           {lot.incrementValue.toLocaleString()}
    //           {lot.incrementType === "FIXED" && " UZS"}
    //           {lot.incrementType === "PERCENTAGE" && "%"}
    //         </Typography>
    //       </Box>
    //     </Box>
    //     <Box display="flex" alignItems="center" gap={0.5} mt={2}>
    //       <AccessTime fontSize="small" />
    //       <Typography variant="body2" color="text.secondary">
    //         {/* {timer} */}
    //         {dayjs(lot?.startTime).format('DD.MM.YYYY HH:mm')}
    //       </Typography>
    //     </Box>
    //     <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
    //       <IconButton onClick={handleLike} color="primary" disabled={isLoading}>
    //         {isLiked ? <Favorite /> : <FavoriteBorder />}
    //       </IconButton>
    //       <Link href={`/lots/${lot.id}`}>
    //         <Button type="contained">
    //           <FormattedMessage id="LotCardMore" defaultMessage="Batafsil" />
    //         </Button>
    //       </Link>
    //     </Box>
    //   </CardContent>
    // </Card>
    <div key={lot.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition group">
      <div className="relative">
        <img
          src={lot?.lotImageDtoList?.[0]?.imageUrl}
          alt={lot.title}
          className="w-full h-48 object-cover object-center group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex justify-between items-center">
            <div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(lot.lotStatus)} flex items-center gap-1`}>
                {getStatusIcon(lot.lotStatus)}
                {getStatusText(lot.lotStatus)}
              </span>
            </div>
            <button
              className="p-1.5 bg-white/90 rounded-full hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                handleLike()
              }}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>
          <h3 className="text-white font-bold text-lg mt-2 drop-shadow-sm">{lot.title}</h3>
          {/* <p className="text-white/90 text-sm drop-shadow-sm">{lot.description}</p> */}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="text-sm font-medium">{seller?.data?.firstname || "Seller"} {seller?.data?.lastname}</div>
            {lot?.seller?.verified && (
              <CheckCircle className="h-4 w-4 text-blue-600 ml-1" />
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Users className="h-3 w-3 mr-1" />
            <span>{counts?.viewCount} ko'rishlar</span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs text-gray-500 mb-1">Boshlang'ich narx</div>
            <div className="text-lg font-bold text-blue-600">{lot.startPrice.toLocaleString()} UZS</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {dayjs(lot?.startTime).format('DD.MM.YYYY HH:mm')}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <Link href={`/lots/${lot.id}`}>
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-1">
            <span>Ishtirok etish</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
