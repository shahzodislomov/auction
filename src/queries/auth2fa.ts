"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";

export interface TwoFactorSetupData {
  secret?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  otpauthUrl?: string;
  manualKey?: string;
  [key: string]: unknown;
}

export interface TwoFactorVerifyPayload {
  code: string;
}

export const setupTwoFactor = async (): Promise<TwoFactorSetupData> => {
  const response = await api.post("/auth/2fa/setup");
  const data = response.data?.data ?? response.data;
  return data ?? {};
};

export const verifyTwoFactor = async (
  payload: TwoFactorVerifyPayload,
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.post("/auth/2fa/verify", payload);
  return response.data?.data ?? response.data ?? { success: true };
};

export const useSetupTwoFactor = () => {
  return useMutation({
    mutationFn: setupTwoFactor,
  });
};

export const useVerifyTwoFactor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyTwoFactor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["authSessions"] });
    },
  });
};
