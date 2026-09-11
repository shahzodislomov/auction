"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

// Fetch transactions by user id
export const fetchAllTransactions = async (page = 0, size = 20) => {
    try {
        const response = await api.get(`/transactions/getAll`, {
            params: { page, size },
        });
        return response.data.meta.list || [];
    } catch (error) {
        console.error("Error fetching transactions by seller id:", error);
        throw error;
    }
};


export const useAllTransactions = (page = 0, size = 20) => {
    return useQuery({
        queryKey: ["userTransactions", page, size],
        queryFn: () => fetchAllTransactions(page, size),
        staleTime: 5 * 60 * 1000, // 5 minutes
        keepPreviousData: true, // Prevent refetching all data when page changes
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

// Fetch transactions by user id
export const fetchAllTransactionsByUserId = async (userId, page = 0, size = 20) => {
    try {
        const response = await api.get(`/transactions/getAllByUserId`, {
            params: { userId, page, size },
        });
        // Safely access the list property
        return response.data?.meta?.list || []; // Return an empty array if list is undefined
    } catch (error) {
        console.error("Error fetching transactions by user id:", error);
        throw error;
    }
};

export const useAllTransactionsByUserId = (userId, page = 0, size = 20) => {
    return useQuery({
        queryKey: ["userTransactions", userId, page, size],
        queryFn: () => fetchAllTransactionsByUserId(userId, page, size),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        keepPreviousData: true, // Prevent refetching all data when page changes
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};
