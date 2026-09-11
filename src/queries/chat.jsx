"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

// Fetch all chats
export const useAllCHats = () => {
    return useQuery('chats', async () => {
        const { data } = await api.get('/chat/getAllUserChats');
        return data.data;
    });
};

// Fetch all chats
export const useSupportChats = (supportId) => {
    return useQuery('supportChats', async () => {
        const { data } = await api.get('/chat/getSupportChats', { params: { supportId } });
        return data.data.chats;
    });
};

// Fetch chat user to support
export const fetchUserToSupportChat = async (senderId) => {
    try {
        const response = await api.get(`/chat/getAllChatMessagesUserToSupport`, {
            params: { senderId },
        });
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching lot:", error);
        throw error;
    }
};

export const useUserToSupportChat = (senderId) => {
    return useQuery({
        queryKey: ["userToSupport", senderId],
        queryFn: () => fetchUserToSupportChat(senderId),
        staleTime: 5 * 60 * 1000, // Adjust if data changes more or less frequently
        onError: (error) => {
            console.error("Query Error:", error);
        },
    });
};

// Fetch chat support to user
export const fetchSupportToUserChat = async (senderId, receiverId) => {
    try {
        const response = await api.get(`/chat/getAllChatMessagesSupportToUser`, {
            params: { senderId, receiverId },
        });
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching lot:", error);
        throw error;
    }
};

export const useSupportToUserChat = (senderId, receiverId) => {
    return useQuery({
        queryKey: ["supportToUser", senderId, receiverId],
        queryFn: () => fetchSupportToUserChat(senderId, receiverId),
        staleTime: 5 * 60 * 1000, // Adjust if data changes more or less frequently
        onError: (error) => {
            console.error("Query Error:", error);
        },
        enabled: !!receiverId
    });
};


// Function to mark a chat as read
export const markChatAsRead = async (chatId, supportId) => {

    try {
        const response = await api.post(`/chat/mark-as-read?chatId=${chatId}&supportId=${supportId}`);        
        return response;
    } catch (error) {
        console.error("Failed to mark chat as read:", error);
        throw error;
    }
};

// Function to send a message to a user
export const sendMessageToUser = async ({ receiverId, chatId, message }) => {
    try {
        return await api.post("/chat/sendMessageToUser", {
            receiverId,
            chatId,
            message,
            read: true
        });
    } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
    }
};