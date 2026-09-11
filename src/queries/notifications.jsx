"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "../api/api";

const notificationList = (payload) => {
    const candidates = [
        payload?.data,
        payload?.data?.content,
        payload?.data?.list,
        payload?.data?.dtoList,
        payload?.meta?.list,
        payload?.content,
        payload?.list,
        payload,
    ];

    return candidates.find(Array.isArray) ?? [];
};

export const fetchNotificationsByUserId = async (userId) => {
    const response = await api.get(`/notification/getAllNotifications/${userId}`);
    return notificationList(response.data);
};

export const useNotificationsByUserId = (userId) => useQuery({
    queryKey: ["notifications", String(userId ?? "")],
    queryFn: () => fetchNotificationsByUserId(userId),
    enabled: Boolean(userId),
    staleTime: 30_000,
});

/**
 * Marks all notifications (or a chat) as read for a specific user.
 * Silences HTTP 404 (Not Found) errors, as the backend may have already purged the notifications.
 * @param {string | number} userId - The ID of the user.
 * @returns {Promise<any>} The backend response.
 */
export const markNotifAsRead = async (userId) => {
    try {
        const response = await api.post(`/notification/markAsReadByUserId/${userId}`);        
        return response;
    } catch (error) {
        if (error?.response?.status !== 404 && error?.status !== 404) {
            console.error("Failed to mark chat as read:", error.message || error, {
                code: error.code,
                status: error.status,
                raw: error.raw,
            });
        }
        throw error;
    }
};

/**
 * Marks a specific notification as read by its unique ID.
 * Silences HTTP 404 (Not Found) errors to prevent console spam for expired or purged notifications.
 * @param {string | number} notifId - The unique ID of the notification.
 * @returns {Promise<any>} The backend response.
 */
export const markNotifAsReadById = async (notifId) => {
    try {
        const response = await api.post(`/notification/markAsReadById/${notifId}`);        
        return response;
    } catch (error) {
        if (error?.response?.status !== 404 && error?.status !== 404) {
            console.error("Failed to mark notification as read:", error.message || error, {
                code: error.code,
                status: error.status,
                raw: error.raw,
                notifId,
            });
        }
        throw error;
    }
};

// Function to send the FCM token to the backend
export const sendFcmToken = async (token, userId) => {
    try {
        const response = await api.post(`/notification/setFireBaseToken?token=${token}${userId !== null ? `&userId=${userId}` : ""}`);
        return response;
    } catch (error) {
        console.error("Failed to send FCM token:", error.message || error, {
            code: error.code,
            status: error.status,
            raw: error.raw,
        });
        throw error;
    }
};

// Function to remove the FCM token from the backend
export const removeFcmToken = async (token) => {
    try {
        const response = await api.post(`/notification/removeFireBaseToken?token=${token}`);
        return response;
    } catch (error) {
        console.error("Failed to remove FCM token:", error.message || error, {
            code: error.code,
            status: error.status,
            raw: error.raw,
        });
        throw error;
    }
};
