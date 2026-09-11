"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { requireMutationSuccess } from "./mutationResponse";

const scopedQueryIds = (value) => {
    if (value === null || value === undefined) return [];
    const canonical = String(value).trim();
    if (!canonical) return [];
    return Object.is(value, canonical) ? [value] : [value, canonical];
};

const invalidateScopedRecord = (queryClient, queryKey, value) => {
    scopedQueryIds(value).forEach((id) => {
        queryClient.invalidateQueries({ queryKey: [queryKey, id] });
    });
};

const invalidateDepositCaches = (queryClient, variables) => {
    const canonicalUserId = String(variables?.userId ?? "").trim();
    const auctionId = variables?.auctionId ?? variables?.lotId;
    invalidateScopedRecord(queryClient, "userDeposits", variables?.userId);
    invalidateScopedRecord(queryClient, "auctionDeposits", auctionId);
    queryClient.invalidateQueries({
        queryKey: ["auctionDepositStatus", variables?.userId, auctionId],
    });
    queryClient.invalidateQueries({ queryKey: ["userTransactions"] });
    invalidateScopedRecord(queryClient, "userTransactions", variables?.userId);
    invalidateScopedRecord(queryClient, "user", variables?.userId);
    if (canonicalUserId) {
        queryClient.invalidateQueries({
            queryKey: ["statisticsByUserId", canonicalUserId],
        });
    }
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    queryClient.invalidateQueries({ queryKey: ["tranStatistics"] });
    invalidateScopedRecord(queryClient, "lotCounts", auctionId);
};

const useDepositMutation = (path, onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (depositData) => {
            const response = await api.post(path, depositData);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (data, variables) => {
            invalidateDepositCaches(queryClient, variables);
            if (onSuccess) onSuccess(data, variables);
        },
        onError: (error) => {
            if (onError) onError(error);
        },
    });
};

export const useDepositToAuctionMutation = (onSuccess, onError) =>
    useDepositMutation("/deposit/depositToAuction", onSuccess, onError);

export const useBlockAuctionDepositMutation = (onSuccess, onError) =>
    useDepositMutation("/deposit/blockDeposit", onSuccess, onError);

export const useRefundAuctionDepositsMutation = (onSuccess, onError) =>
    useDepositMutation("/deposit/refundAuction", onSuccess, onError);

// Keeps older lot UI compatible while sending the current auction DTO.
export const useDepositToLotMutation = (onSuccess, onError) => {
    const mutation = useDepositToAuctionMutation(onSuccess, onError);
    const auctionVariables = (variables) => ({
        userId: variables?.userId,
        auctionId: variables?.auctionId ?? variables?.lotId,
    });
    return {
        ...mutation,
        mutate: (variables, options) => mutation.mutate(auctionVariables(variables), options),
        mutateAsync: (variables, options) =>
            mutation.mutateAsync(auctionVariables(variables), options),
    };
};

export const fetchAuctionDeposits = async (auctionId, page = 0, size = 20) => {
    const response = await api.get(`/deposit/getAuctionDeposits/${auctionId}`, {
        params: { page, size },
    });
    return response.data;
};

export const useAuctionDeposits = (auctionId, page = 0, size = 20) =>
    useQuery({
        queryKey: ["auctionDeposits", auctionId, page, size],
        queryFn: () => fetchAuctionDeposits(auctionId, page, size),
        enabled: Boolean(auctionId),
    });

export const fetchAuctionDepositStatus = async (userId, auctionId) => {
    const response = await api.get("/deposit/getAuctionDepositStatus", {
        params: { userId, auctionId },
    });
    return response.data;
};

export const useAuctionDepositStatus = (userId, auctionId) =>
    useQuery({
        queryKey: ["auctionDepositStatus", userId, auctionId],
        queryFn: () => fetchAuctionDepositStatus(userId, auctionId),
        enabled: Boolean(userId && auctionId),
    });
