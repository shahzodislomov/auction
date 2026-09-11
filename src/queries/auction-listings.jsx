"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api/api";
import { buildVehicleCreatePayload } from "@/features/user-v2/vehicle.mjs";

const AUCTION_STATUSES = new Set([
  "DRAFT",
  "SCHEDULED",
  "LIVE",
  "FINISHED",
  "CANCELED",
]);

const AUCTION_APPROVAL_STATUSES = new Set([
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
]);

export function normalizeAuctionStatusParam(status) {
  const normalized = String(status || "").trim().toUpperCase();
  const corrected = normalized === "SCHEDUED" ? "SCHEDULED" : normalized;
  return AUCTION_STATUSES.has(corrected) ? corrected : null;
}

export function normalizeAuctionApprovalStatusParam(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return AUCTION_APPROVAL_STATUSES.has(normalized) ? normalized : null;
}

function pageParams({
  page = 0,
  size = 20,
  status,
  approvalStatus,
  search,
  make,
  model,
  year,
  region,
  priceFrom,
  priceTo,
} = {}) {
  const params = { page, size };
  const normalizedStatus = normalizeAuctionStatusParam(status);
  const normalizedApprovalStatus = normalizeAuctionApprovalStatusParam(approvalStatus);

  if (normalizedStatus) {
    params.status = normalizedStatus;
  }
  if (normalizedApprovalStatus) {
    params.approvalStatus = normalizedApprovalStatus;
  }
  if (String(search || "").trim()) params.search = String(search).trim();
  if (String(make || "").trim()) params.make = String(make).trim();
  if (String(model || "").trim()) params.model = String(model).trim();
  if (String(year || "").trim()) params.year = String(year).trim();
  if (String(region || "").trim()) params.region = String(region).trim();
  if (String(priceFrom || "").trim()) params.priceFrom = String(priceFrom).trim();
  if (String(priceTo || "").trim()) params.priceTo = String(priceTo).trim();
  return params;
}

export function extractListPayload(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.dtoList)) return body.dtoList;
  if (Array.isArray(body?.list)) return body.list;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.content)) return body.data.content;
  if (Array.isArray(body?.data?.dtoList)) return body.data.dtoList;
  if (Array.isArray(body?.data?.list)) return body.data.list;
  if (Array.isArray(body?.meta?.list)) return body.meta.list;
  return [];
}

export function extractMetaPayload(body) {
  const meta = body?.meta ?? body?.data?.meta ?? null;
  if (!meta || typeof meta !== "object") {
    return { elements: 0, pages: 1 };
  }

  const elements = Number(meta.elements ?? meta.totalElements ?? 0);
  const pages = Number(meta.pages ?? meta.totalPages ?? 1);
  const counts = meta.counts && typeof meta.counts === "object" ? meta.counts : {};

  const normalizeCounts = (value) => {
    if (!value || typeof value !== "object") return {};
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, count]) => {
        const number = Number(count);
        return Number.isFinite(number) && number >= 0
          ? [[String(key).trim().toUpperCase(), number]]
          : [];
      }),
    );
  };
  const all = Number(counts.all ?? elements);
  const normalizedCounts = meta.counts && typeof meta.counts === "object"
    ? {
        all: Number.isFinite(all) && all >= 0 ? all : 0,
        approval: normalizeCounts(counts.approval),
        lifecycle: normalizeCounts(counts.lifecycle),
      }
    : null;

  return {
    ...(normalizedCounts ? { counts: normalizedCounts } : {}),
    elements: Number.isFinite(elements) && elements >= 0 ? elements : 0,
    pages: Number.isFinite(pages) && pages > 0 ? pages : 1,
  };
}

function toNumberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function buildAuctionCreatePayload(input = {}) {
  return {
    vehicleId: toNumberOrZero(input.vehicleId),
    startPrice: toNumberOrZero(input.startPrice),
    reservePrice: toNumberOrZero(input.reservePrice),
    currency: String(input.currency || "").trim().toUpperCase(),
    incrementType: String(input.incrementType || "FIXED").trim().toUpperCase(),
    incrementValue: toNumberOrZero(input.incrementValue),
    depositPercent: toNumberOrZero(input.depositPercent),
    startTime: String(input.startTime || ""),
    endTime: String(input.endTime || ""),
  };
}

export function buildAuctionWithVehiclePayload(input = {}) {
  const auction = buildAuctionCreatePayload(input.auction);
  const { vehicleId: _vehicleId, ...auctionWithoutVehicleId } = auction;
  void _vehicleId;
  return {
    vehicle: buildVehicleCreatePayload(input.vehicle || {}),
    auction: auctionWithoutVehicleId,
  };
}

export async function fetchAuctions(request = {}) {
  const response = await api.get("/auctions", {
    params: pageParams(request),
  });
  return extractListPayload(response.data);
}

// export async function fetchAuctionFeed(request = {}) {
//   const { sellerId, ...rest } = request;
//   const params = pageParams(rest);

//   const hasSeller = sellerId !== null && sellerId !== undefined && String(sellerId).trim();
//   const endpoint = hasSeller
//     ? `/auctions/by-seller/${encodeURIComponent(String(sellerId))}`
//     : "/auctions";
//   const response = await api.get(endpoint, { params });

//   return {
//     items: extractListPayload(response.data),
//     meta: extractMetaPayload(response.data),
//   };
// }


export async function fetchAuctionFeed(request = {}) {
  const { sellerId, status, page = 0, size = 20, ...rest } = request
  const params = {...pageParams(rest), page, size}
  const hasSeller = sellerId !== null && sellerId !== undefined && String(sellerId).trim()
  const endpoint = hasSeller
  ? `/auctions/by-seller/${encodeURIComponent(String(sellerId))}`
  : "/auctions"
  
  if (status === "CURRENT" || status === "ENDED") {
    const statuses = status === "CURRENT"
    ? ["LIVE", "SCHEDULED"]
    : ["FINISHED", "CANCELED"];
    const responses = await Promise.all(
      statuses.map((st) => api.get(endpoint, { params: { ...params, status: st, size: 200 } }))
    );
    let allItems = responses.flatMap((response) => extractListPayload(response.data));
    
    // Only show APPROVED auctions, unless we're looking at a specific seller's own auctions (cabinet)
    if (!hasSeller) {
      allItems = allItems.filter(item => item.approvalStatus === "APPROVED");
    }

    allItems.sort((a,b)=>{
      const aTime = Date.parse(a.startsAt || a.startTime || a.createdAt);
      const bTime = Date.parse(b.startsAt || b.startTime || b.createdAt);
      return bTime - aTime;
    });
    const startIdx = page * size;
    const paginatedItems = allItems.slice(startIdx, startIdx + size);

    return {
      items: paginatedItems,
      meta: {
        pages: Math.ceil(allItems.length / size),
        elements: allItems.length
      }
    };
  }
  if (status) {
    params.status = status;
  }
  const response = await api.get(endpoint, {params})
  return {
    items: extractListPayload(response.data),
    meta: extractMetaPayload(response.data)
  }
}

/** @param {{ page?: number; size?: number; search?: string }} request */
export async function fetchPendingAdminAuctions(request = {}) {
  const { page = 0, size = 20, search } = request;
  /** @type {{ page: number; size: number; search?: string }} */
  const params = { page, size };
  if (String(search || "").trim()) params.search = String(search).trim();
  const response = await api.get("/auctions/admin/pending", { params });

  return {
    items: extractListPayload(response.data),
    meta: extractMetaPayload(response.data),
  };
}

export async function fetchAuction(auctionId) {
  const response = await api.get(`/auctions/${encodeURIComponent(String(auctionId))}`);
  return response.data?.data ?? response.data;
}

export async function fetchAuctionByVehicle(vehicleId) {
  if (!vehicleId || vehicleId === "undefined" || vehicleId === "null") {
    return null;
  }
  try {
    const response = await api.get(`/auctions/by-vehicle/${encodeURIComponent(String(vehicleId))}`, {
      validateStatus: (status) => status >= 200 && status < 500,
    });
    if (response.status === 404) return null;
    return response.data?.data ?? response.data;
  } catch (error) {
    return null;
  }
}

/** @param {{ page?: number; size?: number; sellerId?: string | number | null; search?: string; bodyType?: string; type?: string }} request */
export async function fetchVehicles({ page = 0, size = 20, sellerId, search, bodyType, type } = {}) {
  const params = { page, size };
  if (sellerId !== null && sellerId !== undefined && String(sellerId).trim()) {
    params.sellerId = sellerId;
  }
  if (String(search || "").trim()) params.search = String(search).trim();
  if (String(bodyType || "").trim()) params.bodyType = String(bodyType).trim();
  if (String(type || "").trim()) params.type = String(type).trim();
  const response = await api.get("/vehicles", {
    params,
  });
  return extractListPayload(response.data);
}

/**
 * @param {{ page?: number; size?: number; search?: string }} request
 */
export async function fetchAdminVehicles({ page = 0, size = 20, search } = {}) {
  const params = { page, size };
  if (String(search || "").trim()) params.search = String(search).trim();

  const response = await api.get("/vehicles", {
    params,
  });
  return {
    items: extractListPayload(response.data),
    meta: extractMetaPayload(response.data),
  };
}

export async function createAuction(input = {}) {
  const response = await api.post("/auctions/create", buildAuctionCreatePayload(input));
  return response.data?.data ?? response.data;
}

export async function relistVehicle(vehicleId) {
  const response = await api.post(`/vehicles/${encodeURIComponent(String(vehicleId))}/relist`);
  return response.data?.data ?? response.data;
}

export async function createAuctionWithVehicle(input = {}) {
  const response = await api.post(
    "/auctions/create-with-vehicle",
    buildAuctionWithVehiclePayload(input),
  );
  return response.data?.data ?? response.data;
}

export async function approveAdminAuction(auctionId) {
  const response = await api.patch(`/auctions/admin/${encodeURIComponent(String(auctionId))}/approve`);
  return response.data?.data ?? response.data;
}

export async function rejectAdminAuction({ auctionId, reason }) {
  const response = await api.patch(`/auctions/admin/${encodeURIComponent(String(auctionId))}/reject`, {
    reason: String(reason || "").trim(),
  });
  return response.data?.data ?? response.data;
}

export const useAuctions = (request = {}) =>
  useQuery({
    queryKey: ["auctions", request],
    queryFn: () => fetchAuctions(request),
    staleTime: 30 * 1000,
  });

export const useAuctionFeed = (request = {}) =>
  useQuery({
    queryKey: ["auctionFeed", request],
    queryFn: () => fetchAuctionFeed(request),
    staleTime: 30 * 1000,
  });

export const usePendingAdminAuctions = (request = {}) =>
  useQuery({
    queryKey: ["adminAuctions", "pending", request],
    queryFn: () => fetchPendingAdminAuctions(request),
    staleTime: 30 * 1000,
  });

export const useAuction = (auctionId) =>
  useQuery({
    queryKey: ["auction", String(auctionId)],
    queryFn: () => fetchAuction(auctionId),
    enabled: auctionId !== null && auctionId !== undefined && String(auctionId) !== "",
    staleTime: 30 * 1000,
  });

export const useAuctionByVehicle = (vehicleId) =>
  useQuery({
    queryKey: ["auctionByVehicle", String(vehicleId)],
    queryFn: () => fetchAuctionByVehicle(vehicleId),
    enabled: vehicleId !== null && vehicleId !== undefined && String(vehicleId) !== "" && String(vehicleId) !== "undefined" && String(vehicleId) !== "null",
    staleTime: 30 * 1000,
    retry: false,
  });

export const useVehicles = (request = {}) =>
  useQuery({
    queryKey: ["vehicles", "list", request],
    queryFn: () => fetchVehicles(request),
    enabled:
      request.sellerId !== null &&
      request.sellerId !== undefined &&
      String(request.sellerId).trim() !== "",
    staleTime: 60 * 1000,
  });

export const useAdminVehicles = (request = {}) =>
  useQuery({
    queryKey: ["adminVehicles", request],
    queryFn: () => fetchAdminVehicles(request),
    staleTime: 30 * 1000,
  });

const useAdminAuctionWorkflowMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminVehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["auctionFeed"] });
      queryClient.invalidateQueries({ queryKey: ["adminAuctions", "pending"] });
    },
  });
};

export const useApproveAdminAuction = () =>
  useAdminAuctionWorkflowMutation(approveAdminAuction);

export const useRejectAdminAuction = () =>
  useAdminAuctionWorkflowMutation(rejectAdminAuction);

export const useCreateAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAuction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["auctionFeed"] });
      queryClient.invalidateQueries({ queryKey: ["auctionByVehicle"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles", "list"] });
      queryClient.invalidateQueries({ queryKey: ["adminVehicles"] });
      queryClient.invalidateQueries({ queryKey: ["adminAuctions", "pending"] });
    },
  });
};

export const useRelistVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: relistVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctionByVehicle"] });
      queryClient.invalidateQueries({ queryKey: ["auctionFeed"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useCreateAuctionWithVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAuctionWithVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["auctionFeed"] });
      queryClient.invalidateQueries({ queryKey: ["auctionByVehicle"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["adminVehicles"] });
      queryClient.invalidateQueries({ queryKey: ["adminAuctions", "pending"] });
    },
  });
};

export async function requestAiValuation(vehiclePayload) {
  const response = await api.post("/auctions/estimate-price", vehiclePayload);
  return response.data?.data ?? response.data;
}

export const useAiValuation = () => {
  return useMutation({
    mutationFn: requestAiValuation,
  });
};

export const useGetAiLogs = (vehicleId, params = {}) => {
  return useQuery({
    queryKey: ["aiLogs", vehicleId, params],
    queryFn: async () => {
      if (!vehicleId) return [];
      const response = await api.get(`/admin/vehicles/${encodeURIComponent(String(vehicleId))}/ai-logs`, {
        params,
      });
      const list = extractListPayload(response.data);
      if (Array.isArray(list) && list.length > 0) return list;
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.data?.data)) return response.data.data;
      if (Array.isArray(response.data?.logs)) return response.data.logs;
      if (Array.isArray(response.data?.content)) return response.data.content;
      return [];
    },
    enabled: Boolean(vehicleId),
  });
};

export const useGetAiFailedVehicles = (params = {}) => {
  return useQuery({
    queryKey: ["aiFailedVehicles", params],
    queryFn: async () => {
      const response = await api.get(`/admin/vehicles/ai-failed`, {
        params,
      });
      const list = extractListPayload(response.data);
      if (Array.isArray(list) && list.length > 0) return list;
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.data?.data)) return response.data.data;
      if (Array.isArray(response.data?.vehicles)) return response.data.vehicles;
      if (Array.isArray(response.data?.content)) return response.data.content;
      return [];
    },
  });
};

export const useRetryAiProcessing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleId) => {
      const response = await api.post(`/admin/vehicles/${encodeURIComponent(String(vehicleId))}/ai-retry`);
      return response.data;
    },
    onSuccess: (_, vehicleId) => {
      void queryClient.invalidateQueries({ queryKey: ["aiFailedVehicles"] });
      void queryClient.invalidateQueries({ queryKey: ["aiLogs"] });
      void queryClient.invalidateQueries({ queryKey: ["adminVehicles"] });
    },
  });
};
