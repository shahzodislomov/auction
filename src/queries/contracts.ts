"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";

export interface ContractRecord {
  contractId: number;
  auctionId: number;
  buyerId: number;
  sellerId: number;
  fileUrl: string | null;
  status: string;
  signedAt: string | null;
  createdAt: string;
}

export interface ContractsMeta {
  pages: number;
  elements: number;
  list: ContractRecord[];
}

export interface ContractsResponse {
  status: string;
  meta: ContractsMeta;
}

export interface ContractAuctionVehicle {
  vehicleId?: number;
  sellerId?: number;
  makeName?: string;
  modelName?: string;
  year?: number;
  vin?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  region?: string;
  status?: string;
}

export interface ContractAuctionRecord {
  auctionId?: number;
  vehicleId?: number;
  vehicle?: ContractAuctionVehicle;
  startPrice?: number;
  reservePrice?: number;
  currency?: string;
  currentPrice?: number;
  incrementType?: string;
  incrementValue?: number;
  depositPercent?: number;
  startTime?: string;
  endTime?: string;
  status?: string;
  dealStatus?: string;
  winnerId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractCounterpartyUser {
  id?: number | string;
  userId?: number | string;
  firstname?: string;
  firstName?: string;
  lastname?: string;
  lastName?: string;
  surname?: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  mobile?: string;
  role?: string;
  type?: string;
}

export interface ContractCounterpartyRecord {
  seller?: ContractCounterpartyUser | null;
  sellerDto?: ContractCounterpartyUser | null;
  buyer?: ContractCounterpartyUser | null;
  buyerDto?: ContractCounterpartyUser | null;
  winner?: ContractCounterpartyUser | null;
  winnerDto?: ContractCounterpartyUser | null;
  counterparty?: ContractCounterpartyUser | null;
  user?: ContractCounterpartyUser | null;
  data?: unknown;
  [key: string]: unknown;
}

export const fetchContracts = async (
  page = 0,
  size = 20,
): Promise<ContractsResponse> => {
  const response = await api.get("/contracts/mine", {
    params: { page, size },
  });
  return response.data as ContractsResponse;
};

export const fetchAllContracts = async (
  page = 0,
  size = 20,
): Promise<ContractsResponse> => {
  const response = await api.get("/contracts/all", {
    params: { page, size },
  });
  return response.data as ContractsResponse;
};

export const useContracts = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ["contracts", page, size],
    queryFn: () => fetchContracts(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllContracts = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ["contracts-all", page, size],
    queryFn: () => fetchAllContracts(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

export async function signContract({
  contractId,
  fileUrl,
}: {
  contractId: string | number;
  fileUrl?: string;
}) {
  const payload = fileUrl ? { fileUrl } : {};
  const response = await api.patch(`/contracts/${contractId}/sign`, payload);
  return response.data;
}

export const useSignContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signContract,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contracts"] });
      void queryClient.invalidateQueries({ queryKey: ["contracts-all"] });
    },
  });
};

export const fetchAuctionById = async (
  auctionId: number | string,
): Promise<ContractAuctionRecord | null> => {
  const response = await api.get(`/auctions/${auctionId}`);
  return (response.data?.data ?? null) as ContractAuctionRecord | null;
};

export const useAuctionById = (auctionId: number | string | null | undefined) => {
  return useQuery({
    queryKey: ["auction-by-id", String(auctionId ?? "")],
    queryFn: () => fetchAuctionById(String(auctionId)),
    enabled: auctionId !== null && auctionId !== undefined && String(auctionId).trim() !== "",
    staleTime: 5 * 60 * 1000,
  });
};

export const fetchAuctionCounterparty = async (
  auctionId: number | string,
): Promise<ContractCounterpartyRecord | null> => {
  const response = await api.get(`/auctions/${auctionId}/counterparty`);
  return (response.data?.data ?? response.data ?? null) as ContractCounterpartyRecord | null;
};

export const useAuctionCounterparty = (auctionId: number | string | null | undefined) => {
  return useQuery({
    queryKey: ["auction-counterparty", String(auctionId ?? "")],
    queryFn: () => fetchAuctionCounterparty(String(auctionId)),
    enabled: auctionId !== null && auctionId !== undefined && String(auctionId).trim() !== "",
    staleTime: 5 * 60 * 1000,
  });
};
