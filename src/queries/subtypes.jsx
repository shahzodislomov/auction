"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { requireMutationSuccess } from "./mutationResponse";

// Mutation for creating a lot type
export const useCreateSubType = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const response = await api.post(`/subType/addSubType`, data);
            return requireMutationSuccess(response.data, ["OK", "CREATED"]);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["allSub"] });
            queryClient.invalidateQueries({ queryKey: ["allSubByType"] });
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            console.error("Error creating sub type:", error.response ? error.response.data : error);
            if (onError) onError(error);
        }
    });
};


// Fetch all lot types
export const fetchSub = async () => {
    try {
        const response = await api.get(`/subType/getAll`);
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching lot types:", error);
        throw error;
    }
};

export const useSub = () => {
    return useQuery({
        queryKey: ["allSub"],
        queryFn: () => fetchSub(),
        staleTime: 5 * 60 * 1000, // Adjust if data changes more or less frequently
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};


// Fetch all lot types
export const fetchSubByType = async (lotTypeId) => {
    try {
        const response = await api.get(`/subType/get/${lotTypeId}`);
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching lot types:", error);
        throw error;
    }
};

export const useSubByType = (lotTypeId) => {
    return useQuery({
        queryKey: ["allSubByType", lotTypeId],
        queryFn: () => fetchSubByType(lotTypeId),
        staleTime: 5 * 60 * 1000, // Adjust if data changes more or less frequently
        enabled: !!lotTypeId,
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

export const useUpdateSubTypeMutation = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (subTypeData) => {
            const response = await api.patch("/subType/editSubType", subTypeData);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["allSub"] });
            queryClient.invalidateQueries({ queryKey: ["allSubByType"] });
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            console.error("Error updating lot type:", error.response ? error.response.data : error);
            if (onError) onError(error);
        }
    })
}

export const useDeleteSub = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/subType/deleteSubCategory/${id}`);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["allSub"] });
            queryClient.invalidateQueries({ queryKey: ["allSubByType"] });
            if (onSuccess) onSuccess(data);
        },
        onError,
    });
};
