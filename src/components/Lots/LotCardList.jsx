import { getStorageItem } from "@/utils/storage";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLikeLotMutation, useLikedLots, useLotCounts } from "@/queries/lots";
import { useQueryClient } from "@tanstack/react-query";
import { FormattedMessage, useIntl } from "react-intl";
import dayjs from "dayjs";
import { ArrowUpRight, Award, Calendar, CheckCircle, Clock, Clock3, Eye, Heart, MapPin, Star, Users, Zap } from "lucide-react";
import { useUserById } from "@/queries/users";

export default function LotCardList({ lot }) {
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
        <div key={lot.id} className="flex border-b border-gray-200 hover:bg-gray-50 transition p-4">
            <div className="flex-shrink-0 mr-4">
                <div className="relative group">
                    <img
                        src={lot?.lotImageDtoList?.[0]?.imageUrl}
                        alt={lot.title}
                        className="w-32 h-32 md:w-48 md:h-48 object-cover object-center rounded-lg group-hover:scale-105 transition duration-300"
                    />
                    <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(lot.lotStatus)} flex items-center gap-1`}>
                        {getStatusIcon(lot.lotStatus)}
                        {getStatusText(lot.lotStatus)}
                    </span>

                    {!lot?.seller?.verified && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded-full flex items-center gap-1 text-xs">
                            <CheckCircle className="h-3 w-3 text-blue-600" />
                            <span className="font-medium">Ishonchli sotuvchi</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex gap-2 items-center mb-1">
                            <h3 className="font-semibold text-gray-800 text-lg">{lot.title}</h3>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{lot.category || 'Category'}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{lot.description}</p>

                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{lot.district.region.nameUz}, {lot.district.nameUz}</span>
                            </div>
                            <div className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                <span>{counts.viewCount || 0}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <Award className="h-3 w-3 mr-1 text-yellow-500" />
                                    <span className="font-medium">{seller?.data?.firstname || 'Seller'} {seller?.data?.lastname}</span>
                                </div>
                                <div className="flex items-center ml-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    <span>{lot?.seller?.rating || '4.5'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex">
                        <button
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                            onClick={(e) => {
                                e.preventDefault();
                                handleLike();
                            }}
                        >
                            <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mt-4">
                    <div className="flex gap-6">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Boshlang'ich narx</div>
                            <div className="text-sm font-medium text-gray-700">{lot?.startPrice?.toLocaleString()} UZS</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">O'sib borish</div>
                            <div className="text-sm font-medium text-gray-700">
                                {lot.incrementType === 'PERCENTAGE' && '% '}
                                {lot?.incrementValue.toLocaleString()}
                                {lot.incrementType === 'FIXED' && ' UZS'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Ko'rishlar</div>
                            <div className="text-sm font-medium flex items-center gap-1">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span>{counts.viewCount || 0} ta</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <div className="text-xs text-gray-500 mb-1">Tugash vaqti</div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>
                                    {dayjs(lot?.startTime).format('DD.MM.YYYY HH:mm')}
                                </span>
                            </div>
                        </div>
                        <Link href={`/lots/${lot.id}`}>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-1">
                                <span>Ishtirok etish</span>
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
