"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";
import { resolveAppEnvironment } from "@/config/environment";

const ensureSessionContract = () => {
  const environment = resolveAppEnvironment();

  if (!environment.sessionsPath) {
    throw new Error("auth.sessions.contractUnavailable");
  }

  return environment;
};

export const fetchAuthSessions = async () => {
  const { sessionsPath } = ensureSessionContract();
  const response = await api.get(sessionsPath);
  return response.data?.data ?? response.data ?? [];
};

export const revokeAuthSession = async (sessionId) => {
  const { sessionsPath } = ensureSessionContract();
  await api.delete(`${sessionsPath}/${encodeURIComponent(sessionId)}`);
};

export const revokeOtherAuthSessions = async () => {
  const environment = ensureSessionContract();

  if (!environment.revokeOtherSessionsPath) {
    throw new Error("auth.sessions.revokeOthersContractUnavailable");
  }

  await api.delete(environment.revokeOtherSessionsPath);
};

export const useAuthSessions = () => {
  return useQuery({
    queryKey: ["authSessions"],
    queryFn: fetchAuthSessions,
    retry: false,
  });
};

export const useRevokeAuthSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeAuthSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authSessions"] }),
  });
};

export const useRevokeOtherAuthSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeOtherAuthSessions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authSessions"] }),
  });
};
