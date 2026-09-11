"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

// Fetch all bids
export const fetchAllBids = async (page, size) => {
    try {
        const response = await api.get(`/bids/getAll`, {
            params: { page, size },
        });
        return response.data.meta.list || [];
    } catch (error) {
        console.error("Error fetching transactions by seller id:", error);
        throw error;
    }
};


export const useAllBids = (page = 0, size = 20) => {
    return useQuery({
        queryKey: ["bids"],
        queryFn: () => fetchAllBids(page, size),
        staleTime: 5 * 60 * 1000, // 5 minutes
        keepPreviousData: true, // Prevent refetching all data when page changes
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

// Fetch bid by user id
export const fetchAllBidByBidderId = async (id) => {
    try {
        const response = await api.get(`/bids/getAllBidsByBidderId`, {
            params: { bidderId: id },
        });
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching:", error);
        throw error;
    }
};


export const useAllBidByBidderId = (id) => {
    return useQuery({
        queryKey: ["bidByBidderId", id],
        queryFn: () => fetchAllBidByBidderId(id),
        enabled:
            id !== null &&
            id !== undefined &&
            String(id).trim() !== "" &&
            String(id) !== "0",
        staleTime: 5 * 60 * 1000, // 5 minutes
        keepPreviousData: true, // Prevent refetching all data when page changes
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

// Fetch highest bid
export const fetchHighestBid = async (auctionId) => {
    try {
        const response = await api.get(`/bids/getHighestBid`, {
            params: { auctionId },
        });
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching:", error);
        throw error;
    }
};


export const useHighestBid = (auctionId) => {
    return useQuery({
        queryKey: ["highestBid", auctionId],
        queryFn: () => fetchHighestBid(auctionId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        keepPreviousData: true, // Prevent refetching all data when page changes
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

export const fetchBidsByAuction = async (auctionId) => {
  const response = await api.get(`/bids/getAllBidsByAuctionId`, { params: { auctionId } });
  return response.data.data || [];
};

export const useBidsByLot = (auctionId) => {
    return useQuery({
        queryKey: ["bidsByAuctionId", auctionId],
        queryFn: () => fetchBidsByAuction(auctionId),
        enabled: !!auctionId, // Only fetch if auctionId is available
        staleTime: 5 * 60 * 1000, // 5 minutes
        keepPreviousData: true,
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};
