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

export default function TrendingLotCard({ lot }) {
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
        <tr key={lot.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-md object-cover" src={lot?.lotImageDtoList?.[0]?.imageUrl} alt={lot.title} />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{lot.title}</div>
                        <div className="text-sm text-gray-500 max-w-32 text whitespace-nowrap overflow-ellipsis overflow-hidden">{lot.description}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{lot.category || 'Category'}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-blue-600">
                    {lot.incrementType === 'PERCENTAGE' && '% '}
                    {lot?.incrementValue.toLocaleString()}
                    {lot.incrementType === 'FIXED' && ' UZS'}                                                </div>
                <div className="text-xs text-gray-500">{lot?.startPrice?.toLocaleString()} UZS</div>
            </td>
            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {lot.bids}
                                            </td> */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeStyle(lot.lotStatus)} flex items-center gap-1 w-fit`}>
                    {getStatusIcon(lot.lotStatus)}
                    {getStatusText(lot.lotStatus)}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {lot.endTime}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link href={`/lots/${lot.id}`}>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Ishtirok etish</button>
                </Link>
            </td>
        </tr>
    );
}
