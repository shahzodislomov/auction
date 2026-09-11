"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../api/api";
import { resolveAppEnvironment } from "../config/environment";

// ================= LOGIN =================
export const useLoginMutation = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (loginData) => {
      const response = await api.post("/auth/loginByEmail", loginData, {
        params: loginData,
      });
      return response.data;
    },
    onSuccess,
    onError,
  });
};

function getStoredLang() {
  if (typeof window === "undefined") return "uz";
  try {
    const fromStorage =
      window.localStorage.getItem("tezauksion-locale") ||
      window.localStorage.getItem("language") ||
      window.localStorage.getItem("lang") ||
      window.localStorage.getItem("locale");
    if (fromStorage && ["uz", "ru", "en"].includes(fromStorage.toLowerCase())) {
      return fromStorage.toLowerCase();
    }
  } catch {
    // fallback
  }
  return "uz";
}

// ================= REGISTER =================
export const useRegisterMutation = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (registerData) => {
      if (registerData.channel === "phone") {
        const phonePayload = {
          deviceId: registerData.deviceId,
          password: registerData.password,
          phone: registerData.phone,
        };
        const response = await api.post("/auth/registerByPhone", phonePayload, {
          params: phonePayload,
        });
        return response.data;
      }

      // POST /auth/registerByEmail — backend auto-sends OTP to the email
      const emailPayload = {
        deviceId: registerData.deviceId,
        email: (registerData.email || "").trim().toLowerCase(),
        firstname: registerData.firstname,
        lastname: registerData.lastname,
        password: registerData.password,
        language: getStoredLang(),
      };
      const response = await api.post("/auth/registerByEmail", emailPayload);
      return response.data;
    },
    onSuccess,
    onError,
  });
};

// ================= VERIFY REGISTRATION OTP =================
// POST /auth/register/email/verify-otp  { email, otp }
export const useVerfMutation = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (verfData) => {
      // New endpoint expects { email, otp } — map legacy field names
      const payload = {
        email: (verfData.email || "").trim().toLowerCase(),
        otp: String(verfData.code ?? verfData.otp ?? "").trim(),
      };
      const response = await api.post("/auth/register/email/verify-otp", payload);
      return response.data;
    },
    onSuccess,
    onError,
  });
};

// ================= RESEND CODE =================
export const useReVerfMutation = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async ({ channel = "email", email, phone, userId }) => {
      if (channel === "sms") {
        const { phoneResendOtpPath } = resolveAppEnvironment();

        if (!phoneResendOtpPath) {
          throw new Error("auth.phone.contractUnavailable");
        }

        const response = await api.post(phoneResendOtpPath, { phone, userId });
        return response.data;
      }

      // POST /auth/register/email/send-otp — resend registration OTP
      const response = await api.post("/auth/register/email/send-otp", {
        email,
        language: getStoredLang(),
      });
      return response.data;
    },
    onSuccess,
    onError,
  });
};

// ================= CHECK CODE =================
export const useCheckCodeMutation = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async ({ channel = "email", email, phone, code, deviceId }) => {
      if (channel === "sms") {
        const { phoneVerifyOtpPath } = resolveAppEnvironment();

        if (!phoneVerifyOtpPath) {
          throw new Error("auth.phone.contractUnavailable");
        }

        const response = await api.post(phoneVerifyOtpPath, {
          phone,
          code,
          deviceId,
        });
        return response.data;
      }

      const response = await api.post("/auth/checkCodeByEmail", null, {
        params: { email, code, deviceId },
      });
      return response.data;
    },
    onSuccess,
    onError,
  });
};

// ================= LOT STATISTICS =================
const fetchLotStatistics = async () => {
  try {
    const response = await api.get("/statistics/auctionStatistics", {
      validateStatus: (status) => status >= 200 && status < 500,
    });
    const raw = response.data?.data ?? {};

    const pendingCountResponse = await api.get("/auctions", {
      params: { approvalStatus: "PENDING_REVIEW", page: 99999, size: 1 },
      validateStatus: (status) => status >= 200 && status < 500,
    });
    const pendingMeta = pendingCountResponse.data?.meta;
    const pendingCount = pendingMeta?.counts?.approval?.PENDING_REVIEW ?? pendingMeta?.elements ?? 0;

    return {
      allLotsCount: raw.allCount ?? 0,
      finishedLotsCount: raw.finishedCount ?? 0,
      activeLotsCount: raw.liveCount ?? 0,
      pendingLotsCount: pendingCount,
    };
  } catch (error) {
    return null;
  }
};

export const useLotStatistics = () => {
  return useQuery({
    queryKey: ["lotStatistics"],
    queryFn: fetchLotStatistics,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// ================= USER STATISTICS =================
const fetchUserStatistics = async () => {
  try {
    const response = await api.get("/statistics/userStatistics", {
      validateStatus: (status) => status >= 200 && status < 500,
    });
    if (response.status === 404) return null;
    return response.data?.data ?? null;
  } catch (error) {
    return null;
  }
};

export const useUserStatistics = () => {
  return useQuery({
    queryKey: ["userStatistics"],
    queryFn: fetchUserStatistics,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// ================= TRANSACTION STATISTICS =================
const fetchTranStatistics = async () => {
  try {
    const response = await api.get("/statistics/transactionStatistics", {
      validateStatus: (status) => status >= 200 && status < 500,
    });
    if (response.status === 404) return null;
    return response.data?.data ?? null;
  } catch (error) {
    return null;
  }
};

export const useTranStatistics = () => {
  return useQuery({
    queryKey: ["tranStatistics"],
    queryFn: fetchTranStatistics,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
