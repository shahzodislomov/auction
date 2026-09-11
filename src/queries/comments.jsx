"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";
import { requireMutationSuccess } from "./mutationResponse";

// Create a new comment
const createComment = async ({ vehicleId, comment, userId, parentComment, type }) => {
    const url = parentComment 
        ? `/comment/create?parent_id=${parentComment}`
        : "/comment/create";
    
    const response = await api.post(url, { vehicleId, comment, userId, type });
    return requireMutationSuccess(response.data);
};

export const useCreateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allComments"] });
        },
    });
};

// Get all comments
const getAllComments = async () => {
    const response = await api.get("/comment/getAll");
    return response.data;
};

export const useAllCommentss = () =>
    useQuery({
        queryKey: ["allComments"],
        queryFn: () => getAllComments(),
        keepPreviousData: true,
    });

// Get all comments by lot
const getAllCommentsByVehicle = async (id) => {
    if (!id || id === "undefined" || id === "null") {
        return { status: "OK", data: [] };
    }
    const response = await api.get(`/comment/getByVehicleId/${id}`);
    return response.data;
};

export const useAllCommentsByVehicle = (id) =>
    useQuery({
        queryKey: ["allCommentsByLot", id],
        queryFn: () => getAllCommentsByVehicle(id),
        enabled: Boolean(id && id !== "undefined" && id !== "null"),
        keepPreviousData: true,
    });

// Get all comments count by lot
const getAllCommentsCountByLot = async (id) => {
    if (!id || id === "undefined" || id === "null") {
        return { status: "OK", data: { totalCount: 0, positiveCount: 0, neutralCount: 0, negativeCount: 0 } };
    }
    const response = await api.get(`/comment/commentCounts/${id}`);
    return response.data;
};

export const useAllCommentsCountByLot = (id) =>
    useQuery({
        queryKey: ["allCommentsCountByLot", id],
        queryFn: () => getAllCommentsCountByLot(id),
        enabled: Boolean(id && id !== "undefined" && id !== "null"),
        keepPreviousData: true,
    });

// Delete a comment
const deleteComment = async (id) => {
    const response = await api.delete(`/comment/delete/${id}`);
    return response.data;
};

export const useDeleteCommnet = () => {
    const queryClient = useQueryClient();

    return useMutation(deleteComment, {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allCommentsByLot"] });
        },
    });
};
