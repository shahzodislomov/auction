"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { requireMutationSuccess } from "./mutationResponse";

// Mutation for creating a lot type
export const useCreateLotTypeMutation = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (lotTypeData) => {
            const formData = new FormData();

            // Append the image file to FormData
            if (lotTypeData.image) {
                formData.append("image", lotTypeData.image);
            }

            // Append other fields as parameters
            const params = new URLSearchParams();
            // params.append("attributes", lotTypeData.attributes);
            params.append("name", lotTypeData.name);

            const response = await api.post("/lot-type/create", formData, {
                params: params,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return requireMutationSuccess(response.data, ["OK", "CREATED"]);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["allLotTypes"] });
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            console.error("Error creating lot type:", error.response ? error.response.data : error);
            if (onError) onError(error);
        }
    });
};




// Fetch lot type by id
export const fetchLotType = async (id) => {
    try {
        const response = await api.get(`/lot-type/${id}`);
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching lot types:", error);
        throw error;
    }
};

export const useLotType = (id) => {
    return useQuery({
        queryKey: ["lotbyid", id],
        queryFn: () => fetchLotType(id),
        staleTime: 5 * 60 * 1000, // Adjust if data changes more or less frequently
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};



// Fetch all lot types
export const fetchAllLotTypes = async (page = 0, size = 20) => {
    try {
        const response = await api.get(`/lot-type/all`, {
            params: { page, size },
        });
        return response.data.data.dtoList || [];
    } catch (error) {
        console.error("Error fetching lot types:", error);
        throw error;
    }
};

export const useLotTypes = (page = 0, size = 20) => {
    return useQuery({
        queryKey: ["allLotTypes", page, size],
        queryFn: () => fetchAllLotTypes(page, size),
        staleTime: 5 * 60 * 1000, // Adjust if data changes more or less frequently
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};


// update lot type
export const useUpdateLotTypeMutation = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (lotTypeData) => {
            const formData = new FormData();

            // Append the image file to FormData
            if (lotTypeData.image) {
                formData.append("image", lotTypeData.image);
            }

            // Append other fields as parameters
            const params = new URLSearchParams();
            params.append("id", lotTypeData.id); // Ensure ID is passed
            params.append("name", lotTypeData.name);

            const response = await api.post("/lot-type/update", formData, {
                params: params,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return requireMutationSuccess(response.data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["allLotTypes"] });
            queryClient.invalidateQueries({ queryKey: ["lotbyid"] });
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            console.error("Error updating lot type:", error.response ? error.response.data : error);
            if (onError) onError(error);
        },
    });
};


export const useDeleteLotTypeMutation = (onSuccess, onError) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/lot-type/${id}`);
            return requireMutationSuccess(response.data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["allLotTypes"] });
            queryClient.invalidateQueries({ queryKey: ["lotbyid"] });
            if (onSuccess) onSuccess(data);
        },
        onError,
    });
};
