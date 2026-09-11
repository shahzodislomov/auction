"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { requireMutationSuccess } from "./mutationResponse";

// Mutation for creating a attribute
export const useCreateLotAttribute = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const response = await api.post(`/attribute/addAttribute`, data);
            return requireMutationSuccess(response.data, ["OK", "CREATED"]);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["allAttr"] });
            queryClient.invalidateQueries({ queryKey: ["untiedAttr"] });
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            console.error("Error creating attribute:", error.response ? error.response.data : error);
            if (onError) onError(error);
        }
    });
};

// Mutation for tie an attr
export const useTieAttribute = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ attributeId, subTypeId }) => {
            const response = await api.post(`/attribute/tieAttributeToSubtype/${attributeId}/${subTypeId}`);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["allAttrBySubtype"] });
            queryClient.invalidateQueries({ queryKey: ["untiedAttr"] });
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            console.error("Error creating lot type:", error.response ? error.response.data : error);
            if (onError) onError(error);
        }
    });
};



// Fetch all lot types
export const fetchAttr = async () => {
    try {
        const response = await api.get(`/attribute/getAll`);
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching lot types:", error);
        throw error;
    }
};

export const useAttr = () => {
    return useQuery({
        queryKey: ["allAttr"],
        queryFn: () => fetchAttr(),
        staleTime: 5 * 60 * 1000, // Adjust if data changes more or less frequently
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};


// Fetch all attr by subtype
export const fetchAttrBySubtype = async (id) => {
    try {
        const response = await api.get(`/attribute/get/${id}`);
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching attr:", error);
        throw error;
    }
};

export const useAttrBySubtype = (id) => {
    return useQuery({
        queryKey: ["allAttrBySubtype", id],
        queryFn: () => fetchAttrBySubtype(id),
        staleTime: 5 * 60 * 1000,
        enabled: !!id,
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

// Fetch all attr by subtype
export const fetchAttrOptions = async (id) => {
    try {
        const response = await api.get(`/attribute/getSelectableAttributeValues/${id}`);
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching attr:", error);
        throw error;
    }
};

export const useAttrOptions = (id) => {
    return useQuery({
        queryKey: ["attrOptions", id],
        queryFn: () => fetchAttrOptions(id),
        staleTime: 5 * 60 * 1000,
        enabled: !!id,
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

// Fetch all attr by subtype
export const fetchUntiedAttr = async (id) => {
    try {
        const response = await api.get(`/attribute/getAllUntiedAttributes/${id}`);
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching attr:", error);
        throw error;
    }
};

export const useUntiedAttr = (id) => {
    return useQuery({
        queryKey: ["untiedAttr", id],
        queryFn: () => fetchUntiedAttr(id),
        staleTime: 5 * 60 * 1000,
        enabled: !!id,
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

// Mutation for creating a option to attribute
export const useCreateAttrOption = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data, attributeId }) => {
            const response = await api.post(
                `/attribute/addSelectableAttributeValue?attributeId=${attributeId}`,
                data
            );
            return requireMutationSuccess(response.data, ["OK", "CREATED"]);
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["attrOptions"] });
            if (onSuccess) onSuccess(result);
        },
        onError: (error) => {
            console.error("Error creating option:", error.response ? error.response.data : error);
            if (onError) onError(error);
        }
    });
};

export const useDeleteAttr = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/attribute/deleteAttribute/${id}`);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["allAttr"] });
            queryClient.invalidateQueries({ queryKey: ["allAttrBySubtype"] });
            queryClient.invalidateQueries({ queryKey: ["untiedAttr"] });
            queryClient.invalidateQueries({ queryKey: ["attrOptions"] });
            if (onSuccess) onSuccess(data);
        },
        onError,
    });
};
