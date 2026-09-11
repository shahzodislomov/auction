"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from '../api/api';

// Fetch search history
export const useSearchHistory = (userId) => {
    return useQuery(['searchHistory', userId], async () => {
        const response = await api.get(`/user/searchHistory`, { params: { userId } });
        return response.data.data || [];
    });
};

// Perform a search query for lots (AUCTION v2)
export const useLotSearch = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async ({ searchingKey, userId }) => {
            if (!searchingKey) {
                return [];  // Prevent API call if no search term
            }

            const response = await api.get('/auctions', {
                params: { search: searchingKey, userId },
            });
            return response.data?.data?.content || response.data?.data || [];
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('searchHistory');
            }
        }
    );
};

// Delete search history item
export const useDeleteSearchHistory = () => {
    const queryClient = useQueryClient();
    return useMutation(
        async ({ userId, id }) => {
            await api.delete(`/user/search/${userId}/${id}`);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('searchHistory');
            }
        }
    );
};

// set notify (AUCTION v2)
export const useSetNotify = () => {
    return useMutation(async ({ searchKey, userId }) => {
        const response = await api.post('/saved-searches/create', {
            filters: { searchKey, userId },
            notify: true,
        });
        return response.data;
    });
};
