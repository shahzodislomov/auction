import { getStorageItem } from "@/utils/storage";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLikeLotMutation, useLikedLots, useLotCounts } from "@/queries/lots";
import { useQueryClient } from "@tanstack/react-query";
import { FormattedMessage, useIntl } from "react-intl";
import placeholderImg from '@/assets/placeholder-image.webp'
import dayjs from "dayjs";
import { ArrowUpRight, Calendar, CheckCircle, Clock, Clock3, Eye, Heart, MapPin, Users, Zap } from "lucide-react";
import { useUserById } from "@/queries/users";

export default function LotCardGrid({ lot }) {
    const [isLiked, setIsLiked] = useState(false);
    const userId = getStorageItem("userId");
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
    const { mutate: likeLot } = useLikeLotMutation();

    const handleLike = () => {
        if (!userId) {
            router.push("/login");
            return;
        }
        const previousState = isLiked;
        setIsLiked(!previousState);

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
                    setIsLiked(previousState);
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
        <div key={lot.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition group">
            <div className="relative">
                <img
                    src={lot?.lotImageDtoList?.[0]?.imageUrl}
                    alt={lot.title}
                    className="w-full h-48 object-cover object-center group-hover:scale-105 transition duration-300"
                />
                <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(lot.lotStatus)} flex items-center gap-1`}>
                    {getStatusIcon(lot.lotStatus)}
                    {getStatusText(lot.lotStatus)}
                </span>
                <button
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    onClick={(e) => {
                        e.preventDefault();
                        handleLike();
                    }}
                >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>

                {!lot?.seller?.verified && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded-full flex items-center gap-1 text-xs">
                        <CheckCircle className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">Ishonchli sotuvchi</span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">{lot.title}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full whitespace-nowrap ml-2 flex items-center">{lot.category || 'Category'}</span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-1 max-w-32 text-nowrap whitespace-nowrap overflow-ellipsis overflow-hidden">{lot.description}</p>

                <div className="flex items-center text-xs text-gray-500 mb-3 gap-4 justify-between">
                    <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{lot.district.region.nameUz}, {lot.district.nameUz}</span>
                    </div>
                    {/* <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>{lot.bids || 0} ko'rishlar</span>
            </div> */}
                    <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        <span>{counts?.viewCount || 0}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Boshlang'ich</div>
                        <div className="text-lg font-bold text-blue-600">
                            {lot?.startPrice?.toLocaleString()} UZS
                        </div>
                        <div className="text-xs text-gray-400">
                            Oshib borish: {lot.incrementType === 'PERCENTAGE' && '% '}
                            {lot?.incrementValue.toLocaleString()}
                            {lot.incrementType === 'FIXED' && ' UZS'}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{dayjs(lot?.startTime).format('DD.MM.YYYY HH:mm')}
                            </span>
                        </div>
                        <div className="text-xs text-gray-400">{lot.endTime.split(' ')[1]}</div>
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
