"use client";

import { useEffect, useRef } from "react";
import { useUserContext } from "@/context/UserContext";
import { api } from "@/api/api";
import { getStorageItem } from "@/utils/storage";
import { isSameAccountIdentity, resolveProfileIdentity } from "@/lib/auth/profileIdentity";
import { sendFcmToken } from "@/queries/notifications";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function identityValue(value: unknown): string | number | null {
  return typeof value === "string" || typeof value === "number" ? value : null;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        ready?: () => void;
        expand?: () => void;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
  }
}

export function TelegramMiniAppAutoLogin() {
  const { login, logout, isAuthenticated } = useUserContext() as unknown as {
    login: (token: string) => Promise<unknown>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
  };
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (attemptedRef.current) return;

    const performAutoLogin = async () => {
      // 1. Ensure Telegram WebApp script is loaded if not already in window
      if (!window.Telegram?.WebApp) {
        const scriptId = "telegram-web-app-global-script";
        if (!document.getElementById(scriptId)) {
          const script = document.createElement("script");
          script.id = scriptId;
          script.src = "https://telegram.org/js/telegram-web-app.js";
          script.async = true;
          document.head.appendChild(script);
          await new Promise<void>((res) => {
            script.onload = () => res();
            script.onerror = () => res();
          });
        }
      }

      const tgWebApp = window.Telegram?.WebApp;
      if (tgWebApp) {
        try {
          if (typeof tgWebApp.ready === "function") tgWebApp.ready();
          if (typeof tgWebApp.expand === "function") tgWebApp.expand();
        } catch {
          // Non-critical WebApp call
        }
      }

      const initData = tgWebApp?.initData;
      if (!initData || typeof initData !== "string" || !initData.trim()) {
        return;
      }

      // If user is already logged in, skip duplicate auto-login
      const existingToken = getStorageItem("token");
      if (existingToken && isAuthenticated) {
        return;
      }

      attemptedRef.current = true;

      try {
        const res = await api.post("/auth/telegram-mini-app", { initData });
        const response = res?.data;
        const sessionToken = response?.token || response?.data?.token;

        const rawData = response?.data;
        let userId: string | number | null = null;
        if (typeof rawData === "number" || typeof rawData === "string") {
          userId = rawData;
        } else if (rawData && typeof rawData === "object") {
          const obj = asRecord(rawData);
          const nestedUser = asRecord(obj?.user);
          userId = identityValue(obj?.id ?? obj?.userId ?? nestedUser?.id ?? obj?.data);
        } else if (response?.userId) {
          userId = response.userId;
        } else if (response?.user?.id || response?.meta?.user?.id) {
          userId = response.user?.id || response.meta?.user?.id;
        }

        const hasSessionToken = typeof sessionToken === "string" && sessionToken.trim().length > 0;
        const hasUserId =
          (typeof userId === "number" && Number.isFinite(userId)) ||
          (typeof userId === "string" && String(userId).trim().length > 0);

        if ((response?.status === "OK" || response?.success || hasSessionToken) && hasSessionToken && hasUserId && userId !== null) {
          const profile = await login(sessionToken);
          const profileRecord = asRecord(profile);
          const authoritativeUserId = resolveProfileIdentity(profileRecord ? {
            id: identityValue(profileRecord.id),
            userId: identityValue(profileRecord.userId),
          } : null);
          if (
            authoritativeUserId === null ||
            !isSameAccountIdentity(authoritativeUserId, userId)
          ) {
            await logout();
            return;
          }
          localStorage.setItem("userId", String(authoritativeUserId));
          const storedToken = getStorageItem("fcmToken");
          if (storedToken) {
            try {
              await sendFcmToken(storedToken, authoritativeUserId);
            } catch {
              // Notification registration optional
            }
          }
        }
      } catch (err) {
        console.error("Global Telegram Mini App auto-login error:", err);
      }
    };

    void performAutoLogin();
  }, [isAuthenticated, login, logout]);

  return null;
}
