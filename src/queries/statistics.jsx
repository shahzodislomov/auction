"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "../api/api";

const canonicalStatisticsUserId = (value) => {
  if (value == null) return "";
  const normalized = String(value).trim();
  const numeric = Number(normalized);
  return normalized && Number.isSafeInteger(numeric) && numeric > 0 ? String(numeric) : "";
};

export const fetchUserStatistics = async (userId) => {
  const canonicalUserId = canonicalStatisticsUserId(userId);
  if (!canonicalUserId) throw new Error("A valid user identifier is required.");
  const response = await api.get(`/statistics/statisticsByUserId/${canonicalUserId}`);
  return response.data?.data ?? null;
};

export const useUserStatistics = (userId) => {
  const canonicalUserId = canonicalStatisticsUserId(userId);
  return useQuery({
    queryKey: ["statisticsByUserId", canonicalUserId],
    queryFn: () => fetchUserStatistics(canonicalUserId),
    enabled: Boolean(canonicalUserId),
    staleTime: 5 * 60 * 1000,
  });
};
