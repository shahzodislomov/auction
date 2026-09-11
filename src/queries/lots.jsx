"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { toast } from "react-toastify";
import { requireMutationSuccess } from "./mutationResponse";

// Mutation for creating a lot
export const useCreateLotMutation = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (lotData) => {
            const formData = new FormData();


            // Ensure images is an array before appending
            if (Array.isArray(lotData.images) && lotData.images.length > 0) {
                lotData.images.forEach((file) => {
                    formData.append(`images`, file); // This ensures the backend gets distinct keys
                });
            }

            if (Array.isArray(lotData.documents) && lotData.documents.length > 0) {
                lotData.documents.forEach((file) => {
                    formData.append("documents", file);
                });
            }

            const params = new URLSearchParams();


            Object.keys(lotData).forEach((key) => {
                if (key !== "images" && key !== "documents") {
                    params.append(key, lotData[key]);
                }
            });

            const response = await api.post("/auctions/create-with-vehicle", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                params: params
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data?.status === "CREATED") {
                [
                    "lotsBySellerId",
                    "allLotsAvailable",
                    "allLots",
                    "allLotsApproved",
                    "allLotsNotApproved",
                    "initialLots",
                    "lotStatistics",
                    "monthlyStats",
                    "statisticsByUserId",
                ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] }));
            }
            if (onSuccess) onSuccess(data);
        },
        onError,
    });
};





// Fetch all lots (AUCTION v2)
export const fetchAllLotsAvailable = async (page = 0, size = 20) => {
    try {
        const response = await api.get(`/auctions`, {
            params: { page, size },
        });
        return response.data?.data?.content || response.data?.data?.dtoList || response.data?.data || [];
    } catch (error) {
        console.error("Error fetching available auctions:", error);
        toast.error("Не удалось загрузить лоты, попробуйте позже");
        return [];
    }
};

export const useAllLotsAvailable = (page = 0, size = 20) => {
    return useQuery({
        queryKey: ["allLotsAvailable", page, size],
        queryFn: () => fetchAllLotsAvailable(page, size),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};


// Fetch all lots (AUCTION v2)
export const fetchAllLots = async (page = 0, size = 20) => {
    try {
        const response = await api.get(`/auctions`, {
            params: { page, size },
        });
        return response.data?.data?.content || response.data?.data?.dtoList || [];
    } catch (error) {
        console.error("Error fetching auctions:", error);
        toast.error("Не удалось загрузить список аукционов");
        return [];
    }
};

export const useAllLots = (page = 0, size = 20) => {
    return useQuery({
        queryKey: ["allLots", page, size],
        queryFn: () => fetchAllLots(page, size),
        staleTime: 5 * 60 * 1000, // Adjust if data changes more or less frequently
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};


// Fetch all lots APPROVED (AUCTION v2)
export const fetchAllLotsApproved = async (page = 0, size = 20) => {
    try {
        const response = await api.get(`/auctions`, {
            params: { page, size, approvalStatus: "APPROVED" },
            validateStatus: (status) => status >= 200 && status < 500,
        });
        if (response.status >= 400) return [];
        return response.data?.data?.content || response.data?.data || [];
    } catch (error) {
        return [];
    }
};

export const useAllLotsApproved = (page = 0, size = 20) => {
    return useQuery({
        queryKey: ["allLotsApproved", page, size],
        queryFn: () => fetchAllLotsApproved(page, size),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};

// Fetch all lots DECLINED (AUCTION v2)
export const fetchAllLotsDeclined = async (page = 0, size = 20) => {
    try {
        const response = await api.get(`/auctions`, {
            params: { page, size, approvalStatus: "REJECTED" },
            validateStatus: (status) => status >= 200 && status < 500,
        });
        if (response.status >= 400) return [];
        return response.data?.data?.content || response.data?.data || [];
    } catch (error) {
        return [];
    }
};

export const useAllLotsDeclined = (page = 0, size = 20) => {
    return useQuery({
        queryKey: ["allLotsDeclined", page, size],
        queryFn: () => fetchAllLotsDeclined(page, size),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};


// Fetch all lots NOT APPROVED (AUCTION v2)
export const fetchAllLotsNotApproved = async (page = 0, size = 20) => {
    try {
        const response = await api.get(`/auctions`, {
            params: { page, size, approvalStatus: "PENDING_REVIEW" },
            validateStatus: (status) => status >= 200 && status < 500,
        });
        if (response.status >= 400) return [];
        return response.data?.data?.content || response.data?.data || [];
    } catch (error) {
        return [];
    }
};

export const useAllLotsNotApproved = (page = 0, size = 20) => {
    return useQuery({
        queryKey: ["allLotsNotApproved", page, size],
        queryFn: () => fetchAllLotsNotApproved(page, size),
        staleTime: 5 * 60 * 1000, // Adjust if data changes more or less frequently
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};


// Fetch lot by id (AUCTION v2)
export const fetchLot = async (id) => {
    if (!id || id === "undefined" || id === "null") return null;
    try {
        const response = await api.get(`/auctions/${id}`);
        return response.data?.data || null;
    } catch (error) {
        console.error(`Error fetching auction ${id}:`, error);
        toast.error("Не удалось загрузить данные лота");
        return null;
    }
};

export const useLot = (id) => {
    return useQuery({
        queryKey: ["lot", id],
        queryFn: () => fetchLot(id),
        enabled: Boolean(id && id !== "undefined" && id !== "null"),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};


// Fetch lots by seller id (AUCTION v2)
export const fetchAllLotsBySellerId = async (sellerId, page = 0, size = 20) => {
    try {
        const response = await api.get(`/auctions/by-seller/${sellerId}`, {
            params: { page, size },
        });
        return response.data?.data?.content || response.data?.data || [];
    } catch (error) {
        console.error("Error fetching lots by seller id:", error);
        toast.error("Не удалось загрузить лоты продавца");
        return [];
    }
};

export const useAllLotsBySellerId = (sellerId, page = 0, size = 20) => {
    return useQuery({
        queryKey: ["lotsBySellerId", sellerId, page, size],
        queryFn: () => fetchAllLotsBySellerId(sellerId, page, size),
        enabled: !!sellerId,
        staleTime: 5 * 60 * 1000,
        keepPreviousData: true,
    });
};

// Fetch winning lots by user id (AUCTION v2)
export const fetchWinningLots = async (userId, page = 0, size = 20) => {
    try {
        const response = await api.get(`/auctions/winning`, {
            params: { page, size },
        });
        return response.data?.data?.content || response.data?.data || [];
    } catch (error) {
        console.error("Error fetching winning lots:", error);
        toast.error("Не удалось загрузить выигранные лоты");
        return [];
    }
};



export const useWinningLots = (userId, page = 0, size = 20) => {
    return useQuery({
        queryKey: ["winningLots", userId, page, size],
        queryFn: () => fetchWinningLots(userId, page, size),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        keepPreviousData: true, // Prevent refetching all data when page changes
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};




// update lot

const lotMutationListKeys = [
    "lotsBySellerId",
    "allLotsAvailable",
    "allLots",
    "allLotsApproved",
    "allLotsNotApproved",
    "allLotsDeclined",
    "initialLots",
    "recLots",
    "like",
    "userAuctions",
    "winningLots",
    "lotStatistics",
    "monthlyStats",
    "statisticsByUserId",
];

const invalidateLotMutationCaches = (queryClient, id) => {
    if (id !== null && id !== undefined && String(id).trim()) {
        queryClient.invalidateQueries({ queryKey: ["lot", id] });
        const routeId = String(id).trim();
        if (!Object.is(id, routeId)) {
            queryClient.invalidateQueries({ queryKey: ["lot", routeId] });
        }
    }
    lotMutationListKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
    });
};

export const useUpdateLotMutation = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (lotData) => {
            const response = await api.put(`/vehicles/${lotData.id || lotData.vehicleId}`, lotData);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (data, variables) => {
            invalidateLotMutationCaches(queryClient, variables?.id);
            if (onSuccess) onSuccess(data);
        },
        onError,
    });
};

export const useDeleteLotMutation = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/auctions/${id}`);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (data, variables) => {
            invalidateLotMutationCaches(queryClient, variables);
            if (onSuccess) onSuccess(data);
        },
        onError: onError || ((err) => toast.error("Не удалось удалить лот")),
    });
};

export const useMarkDeletedMutation = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.patch(`/admin/vehicles/${id}/reject`);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (data, variables) => {
            invalidateLotMutationCaches(queryClient, variables);
            if (onSuccess) onSuccess(data);
        },
        onError: onError || ((err) => toast.error("Не удалось архивировать лот")),
    });
};

export const useApproveLotMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await api.patch(`/auctions/admin/${id}/approve`);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (_data, variables) => {
            invalidateLotMutationCaches(queryClient, variables);
            toast.success("Лот успешно одобрен!");
        },
        onError: (error) => {
            toast.error("Не удалось одобрить лот.");
            console.error(error);
        },
    });
};

export const useDeclineLotMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await api.patch(`/auctions/admin/${id}/reject`);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (_data, variables) => {
            invalidateLotMutationCaches(queryClient, variables);
            toast.success("Лот успешно отклонён!");
        },
        onError: (error) => {
            toast.error("Не удалось отклонить лот.");
            console.error(error);
        },
    });
};

// Fetch initial lots (AUCTION v2)
export const fetchInitialLots = async () => {
    try {
        const response = await api.get(`/auctions`, { params: { page: 0, size: 20, status: "LIVE" } });
        return response.data?.data?.content || response.data?.data || [];
    } catch (error) {
        console.error("Error fetching initial lots:", error);
        toast.error("Не удалось загрузить начальные лоты");
        return [];
    }
};

export const useInitialLots = () => {
    return useQuery({
        queryKey: ["initialLots"],
        queryFn: () => fetchInitialLots(),
        // The homepage contains live prices, statuses, and entry CTAs. Keep it
        // fresh while the tab is open instead of treating a live auction as a
        // five-minute static catalogue record.
        staleTime: 10 * 1000,
        refetchInterval: 10 * 1000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

// Fetch initial lots
export const fetchRecLots = async (userId, topN) => {
    try {
        const response = await api.get(`/rec/recommendedLots?topN=${topN}${userId ? `&userId=${userId}` : ""}`);
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching lots:", error);
        throw error;
    }
};

export const useRecLots = (userId, topN) => {
    return useQuery({
        queryKey: ["recLots", userId, topN],
        queryFn: () => fetchRecLots(userId, topN),
        staleTime: 5 * 60 * 1000,
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

const DEMO_USER_IDS = new Set(["demo", "mock", "test"]);

const canonicalLikedUserId = (userId) => {
    if (userId == null) return "";
    const normalized = String(userId).trim();
    if (normalized === "0" || DEMO_USER_IDS.has(normalized)) return "";
    return normalized;
};

const requireNoExplicitMutationFailure = (data) => {
    const nested = data?.data && typeof data.data === "object" ? data.data : null;
    const body = typeof data === "object" && data !== null ? data : nested;
    const status = body?.status ?? nested?.status;
    if (typeof status === "string" && status !== "OK") {
        const error = new Error(
            body?.message ?? nested?.message ?? "The server rejected the watchlist update.",
        );
        error.response = data;
        throw error;
    }
    return data;
};

const getLocalStorageKey = (userId) => {
    const canonical = canonicalLikedUserId(userId);
    return canonical && canonical !== "0"
        ? `tez_auction_user_liked_lots_objects_v2_${canonical}`
        : "tez_auction_user_liked_lots_objects_v2_guest";
};

const getPersistedLikedLots = (userId) => {
    if (typeof window === "undefined") return [];
    try {
        const key = getLocalStorageKey(userId);
        const stored = localStorage.getItem(key);
        if (!stored && key !== "tez_auction_user_liked_lots_objects_v2_guest") {
            const legacy = localStorage.getItem("tez_auction_user_liked_lots_objects_v2");
            if (legacy) {
                localStorage.setItem(key, legacy);
                const parsedLegacy = JSON.parse(legacy);
                return Array.isArray(parsedLegacy) ? parsedLegacy : [];
            }
        }
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const getPersistedLikedLotIds = (userId) => {
    return getPersistedLikedLots(userId).map((item) => String(item.id ?? item.auctionId ?? item.lotId)).filter(Boolean);
};

const savePersistedLikedLot = (lotObj, userId) => {
    if (typeof window === "undefined" || !lotObj) return;
    try {
        const key = getLocalStorageKey(userId);
        const current = getPersistedLikedLots(userId);
        const strId = String(lotObj.id ?? lotObj.auctionId ?? lotObj.lotId);
        if (!strId) return;
        const index = current.findIndex((item) => String(item.id ?? item.auctionId ?? item.lotId) === strId);
        let next;
        if (index >= 0) {
            next = [...current];
            next[index] = { ...next[index], ...lotObj };
        } else {
            next = [...current, lotObj];
        }
        localStorage.setItem(key, JSON.stringify(next));
    } catch {}
};

const removePersistedLikedLot = (lotId, userId) => {
    if (typeof window === "undefined" || !lotId) return;
    try {
        const key = getLocalStorageKey(userId);
        const current = getPersistedLikedLots(userId);
        const strId = String(lotId);
        const next = current.filter((item) => String(item.id ?? item.auctionId ?? item.lotId) !== strId);
        localStorage.setItem(key, JSON.stringify(next));
    } catch {}
};

// Like a lot
export const useLikeLotMutation = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ lotId, userId, isLiked, lotData }) => {
            let shouldDelete = isLiked;
            if (shouldDelete === undefined) {
                const canonicalUserId = canonicalLikedUserId(userId);
                const likedLots = queryClient.getQueryData(["like", canonicalUserId]);
                const localIds = getPersistedLikedLotIds(userId);
                shouldDelete = (Array.isArray(likedLots) && likedLots.some(
                    (lot) => String(lot.id) === String(lotId) || String(lot.auctionId) === String(lotId)
                )) || localIds.includes(String(lotId));
            }
            if (shouldDelete) {
                try {
                    const response = await api.delete(`/favorites/${lotId}`);
                    const data = requireNoExplicitMutationFailure(response.data);
                    return { ...data, status: "UNLIKED", unliked: true };
                } catch (err) {
                    const statusCode = err?.response?.status || err?.status;
                    if (statusCode === 404 || statusCode === 400) {
                        return { status: "UNLIKED", unliked: true, message: "Unliked" };
                    }
                    throw err;
                }
            } else {
                try {
                    const response = await api.post(`/favorites/${lotId}`);
                    const data = requireNoExplicitMutationFailure(response.data);
                    return { ...data, status: "LIKED", liked: true };
                } catch (err) {
                    const statusCode = err?.response?.status || err?.status;
                    if (statusCode === 409) {
                        // Already favorited on server: treat as success LIKED state
                        return { status: "LIKED", liked: true, message: "Liked" };
                    }
                    throw err;
                }
            }
        },
        retry: false,
        onSuccess: (data, variables) => {
            const { lotId, userId, lotData } = variables || {};
            const canonicalUserId = canonicalLikedUserId(userId);

            const isLikedState =
                data?.liked === true ||
                data?.status === "LIKED" ||
                (typeof data?.message === "string" && data.message.toLowerCase().includes("liked") && !data.message.toLowerCase().includes("unliked"));

            const isUnlikedState =
                data?.liked === false ||
                data?.unliked === true ||
                data?.status === "UNLIKED" ||
                (typeof data?.message === "string" && data.message.toLowerCase().includes("unliked"));

            const singleCached = typeof queryClient?.getQueryData === "function" ? queryClient.getQueryData(["lot", lotId]) : null;
            const allCached = typeof queryClient?.getQueryData === "function" ? (queryClient.getQueryData(["allLots"]) || queryClient.getQueryData(["allLotsAvailable"]) || queryClient.getQueryData(["initialLots"])) : null;
            const allList = Array.isArray(allCached) ? allCached : Array.isArray(allCached?.content) ? allCached.content : Array.isArray(allCached?.data) ? allCached.data : [];
            const foundInAll = allList.find((l) => String(l.id) === String(lotId) || String(l.auctionId) === String(lotId));
            const fullObj = lotData || singleCached || foundInAll || { id: lotId, auctionId: lotId };

            if (isLikedState) {
                savePersistedLikedLot(fullObj, userId);
            } else if (isUnlikedState) {
                removePersistedLikedLot(lotId, userId);
            }

            const updateCacheList = (oldData) => {
                const list = Array.isArray(oldData) ? oldData : [];
                if (isLikedState) {
                    if (!list.some((item) => String(item.id) === String(lotId) || String(item.auctionId) === String(lotId))) {
                        return [...list, fullObj];
                    }
                    return list.map((item) => String(item.id ?? item.auctionId) === String(lotId) ? { ...item, ...fullObj } : item);
                } else if (isUnlikedState) {
                    return list.filter((item) => String(item.id) !== String(lotId) && String(item.auctionId) !== String(lotId));
                }
                return list;
            };

            if (typeof queryClient?.setQueryData === "function") {
                queryClient.setQueryData(["like", canonicalUserId], updateCacheList);
                queryClient.setQueryData(["like", userId], updateCacheList);
                queryClient.setQueryData(["likedLots", userId], updateCacheList);
            }

            queryClient.invalidateQueries({ queryKey: ["allLots"] });
            queryClient.invalidateQueries({ queryKey: ["allLotsAvailable"] });
            queryClient.invalidateQueries({ queryKey: ["initialLots"] });
            queryClient.invalidateQueries({ queryKey: ["lot", lotId] });
            if (canonicalUserId) {
                queryClient.invalidateQueries({ queryKey: ["like", canonicalUserId] });
            }
            if (onSuccess) onSuccess(data);
        },
        onError,
    });
};


// Fetch liked lots
export const fetchLikedLots = async (userId) => {
    let serverContent = [];
    try {
        const response = await api.get(`/favorites`, { params: { size: 100 } });
        const content = response.data?.data?.content || response.data?.content || response.data;
        serverContent = Array.isArray(content) ? content : [];
    } catch (error) {
        serverContent = [];
    }

    const localLots = getPersistedLikedLots(userId);
    if (localLots.length === 0) return serverContent;

    const mergedList = [...serverContent];
    for (const localObj of localLots) {
        const strId = String(localObj.id ?? localObj.auctionId ?? localObj.lotId);
        const existingIndex = mergedList.findIndex((item) => String(item.id ?? item.auctionId ?? item.lotId) === strId);
        if (existingIndex >= 0) {
            mergedList[existingIndex] = { ...localObj, ...mergedList[existingIndex] };
        } else {
            mergedList.push(localObj);
        }
    }
    return mergedList;
};

export const useLikedLots = (userId) => {
    const canonicalUserId = canonicalLikedUserId(userId);
    return useQuery({
        queryKey: ["like", canonicalUserId],
        queryFn: () => fetchLikedLots(canonicalUserId),
        enabled: Boolean(canonicalUserId), // Only execute the query if userId is truthy (not null or undefined)
        staleTime: 5 * 60 * 1000, // 5 minutes
        keepPreviousData: true, // Prevent refetching all data when page changes
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

// Fetch participated lots by user id
export const fetchUserParticipated = async (userId) => {
    if (!userId || userId === "undefined" || userId === "null") {
        return [];
    }
    try {
        const response = await api.get(`/auctions/participated`);
        return response.data?.data?.content || response.data?.data || [];
    } catch (error) {
        console.error("Error fetching participated auctions:", error);
        toast.error("Не удалось загрузить ваши аукционы");
        return [];
    }
};

export const useUserParticipated = (userId) => {
    return useQuery({
        queryKey: ["userAuctions", userId],
        queryFn: () => fetchUserParticipated(userId),
        staleTime: 5 * 60 * 1000,
        keepPreviousData: true,
        enabled: Boolean(userId && userId !== "undefined" && userId !== "null"),
    });
};

// Fetch lot images
export const fetchLotImages = async (lotId) => {
    if (!lotId || lotId === "undefined" || lotId === "null") {
        return [];
    }
    try {
        const response = await api.get(`/lot-image/getAllByLotId/${lotId}`, {
            validateStatus: (status) => status >= 200 && status < 500,
        });
        if (response.status === 404) return [];
        return response.data?.data || [];
    } catch (error) {
        return [];
    }
};

export const useLotImages = (lotId) => {
    return useQuery({
        queryKey: ["lotImages", lotId],
        queryFn: () => fetchLotImages(lotId),
        staleTime: 5 * 60 * 1000,
        keepPreviousData: true,
        retry: false,
        enabled: Boolean(lotId && lotId !== "undefined" && lotId !== "null"),
    });
};

// Fetch lot counts
export const fetchLotCounts = async (lotId) => {
    if (!lotId || lotId === "undefined" || lotId === "null") {
        return [];
    }
    try {
        const response = await api.get(`/auctions/${lotId}`);
        return response.data?.data || [];
    } catch (error) {
        console.error(`Error fetching auction stats ${lotId}:`, error);
        return [];
    }
};

export const useLotCounts = (lotId) => {
    return useQuery({
        queryKey: ["lotCounts", lotId],
        queryFn: () => fetchLotCounts(lotId),
        staleTime: 5 * 60 * 1000,
        keepPreviousData: true,
        enabled: Boolean(lotId && lotId !== "undefined" && lotId !== "null"),
    });
};

// Fetch banners
export const fetchBanner = async () => {
    try {
        const response = await api.get(`/lot-banner/getAll`);
        return response.data?.meta?.list || [];
    } catch (error) {
        return [];
    }
};

export const useBanner = () => {
    return useQuery({
        queryKey: ["banner"],
        queryFn: () => fetchBanner(),
        staleTime: 5 * 60 * 1000,
        keepPreviousData: true,
    });
};


// Mutation for adding banner to a lot
export const useAddBannerMutation = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ lotId, banner, expiresDate }) => {
            const formData = new FormData();
            formData.append("banner", banner); // Only the file is in the body

            const response = await api.post(
                `/lot-banner/add-banner?lotId=${lotId}&expiresAt=${expiresDate}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            return requireMutationSuccess(response.data, ["OK", "CREATED"]);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["banner"] });
            if (data?.lotId) queryClient.invalidateQueries({ queryKey: ["lot", data.lotId] });
            if (onSuccess) onSuccess(data);
        },
        onError,
    });
};


export const useDeleteBannerMutation = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (lotId) => {
            const response = await api.delete(`/lot-banner/${lotId}`);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["banner"] });
            if (onSuccess) onSuccess(data);
        },
        onError,
    });
};


// Fetch monthly stats
export const fetchMonthlyStats = async () => {
    try {
        const response = await api.get(`/statistics/monthly-statistics`);
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching lot:", error);
        throw error;
    }
};

export const useMonthlyStats = () => {
    return useQuery({
        queryKey: ["monthlyStats"],
        queryFn: () => fetchMonthlyStats(),
        staleTime: 5 * 60 * 1000, // Adjust if data changes more or less frequently
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};
