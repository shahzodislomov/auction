import { getStorageItem } from "@/utils/storage";
import React, { useState, useEffect } from "react";
import { api } from "@/api/api";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { sendFcmToken } from "@/queries/notifications";
import { FormattedMessage, useIntl } from "react-intl";
import { safeReturnPath } from "@/lib/navigation/safeReturnPath";
import { useTask6Copy } from "@/locales/task6";
import { isSameAccountIdentity, resolveProfileIdentity } from "@/lib/auth/profileIdentity";

export const TelegramIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="currentColor"
        className="shrink-0 text-white w-6 h-6 sm:w-7 sm:h-7"
        {...props}
    >
        <path d="M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

function loadTelegramScript() {
    return new Promise((resolve) => {
        if (typeof window === "undefined") return resolve(false);
        if (window.Telegram?.Login) return resolve(true);
        if (process.env.NODE_ENV === "test") return resolve(true);
        
        const existingScript = document.getElementById("telegram-widget-script");
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true), { once: true });
            return;
        }
        
        const script = document.createElement("script");
        script.id = "telegram-widget-script";
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
    });
}

const TelegramLoginButton = ({ deviceId, returnTo = "/" }) => {
    const { login, logout } = useUserContext();
    const router = useRouter();
    const intl = useIntl();
    const copy = useTask6Copy();
    const [feedback, setFeedback] = useState(null);
    const [busy, setBusy] = useState(false);
    const destination = safeReturnPath(returnTo);

    const handleMiniAppAuth = async (initData) => {
        const res = await api.post("/auth/telegram-mini-app", { initData });
        const response = res?.data;
        const sessionToken = response?.token || response?.data?.token;

        const rawData = response?.data;
        let userId = null;
        if (typeof rawData === "number" || typeof rawData === "string") {
            userId = rawData;
        } else if (rawData && typeof rawData === "object") {
            userId = rawData.id ?? rawData.userId ?? rawData.user?.id ?? rawData.data;
        } else if (response?.userId) {
            userId = response.userId;
        } else if (response?.user?.id || response?.meta?.user?.id) {
            userId = response.user?.id || response.meta?.user?.id;
        }

        const hasSessionToken = typeof sessionToken === "string" && sessionToken.trim().length > 0;
        const hasUserId =
            (typeof userId === "number" && Number.isFinite(userId)) ||
            (typeof userId === "string" && String(userId).trim().length > 0);

        if ((response?.status === "OK" || response?.success || hasSessionToken) && hasSessionToken && hasUserId) {
            const profile = await login(sessionToken);
            const authoritativeUserId = resolveProfileIdentity(profile);
            if (
                authoritativeUserId === null ||
                !isSameAccountIdentity(authoritativeUserId, userId)
            ) {
                await logout();
                throw new Error("Telegram Mini App authentication identity mismatch");
            }
            localStorage.setItem("userId", String(authoritativeUserId));
            const storedToken = getStorageItem("fcmToken");
            if (storedToken) {
                try {
                    await sendFcmToken(storedToken, authoritativeUserId);
                } catch {
                    // Notification registration is optional
                }
            }
            const successMessage = intl.formatMessage({
                id: "success",
                defaultMessage: "Success!",
            });
            toast.success(successMessage);
            setFeedback({ tone: "success", message: successMessage });
            router.push(destination);
            return true;
        }
        throw new Error("Telegram Mini App authentication was rejected");
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const initData = window.Telegram?.WebApp?.initData;
        if (initData && typeof initData === "string" && initData.trim().length > 0) {
            let active = true;
            Promise.resolve().then(() => {
                if (!active) return;
                setBusy(true);
                return handleMiniAppAuth(initData);
            }).catch((err) => {
                if (!active) return;
                console.error("Auto Telegram Mini App auth error:", err);
                setBusy(false);
            });
            return () => { active = false; };
        }
    }, [handleMiniAppAuth]);

    const handleBackendAuth = async (telegramAuthData) => {
        const encodedDeviceId = deviceId ? encodeURIComponent(deviceId) : "";
        const requestUrl = `/auth/telegram${encodedDeviceId ? `?deviceId=${encodedDeviceId}` : ""}`;
        
        const res = await api.post(requestUrl, telegramAuthData);
        const response = res?.data;
        const sessionToken = response?.token || response?.data?.token;
        
        const rawData = response?.data;
        let userId = null;
        if (typeof rawData === "number" || typeof rawData === "string") {
            userId = rawData;
        } else if (rawData && typeof rawData === "object") {
            userId = rawData.id ?? rawData.userId ?? rawData.user?.id ?? rawData.data;
        } else if (response?.userId) {
            userId = response.userId;
        } else if (response?.user?.id) {
            userId = response.user.id;
        }

        const hasSessionToken = typeof sessionToken === "string" && sessionToken.trim().length > 0;
        const hasUserId =
            (typeof userId === "number" && Number.isFinite(userId)) ||
            (typeof userId === "string" && String(userId).trim().length > 0);

        if ((response?.status === "OK" || response?.success || hasSessionToken) && hasSessionToken && hasUserId) {
            const profile = await login(sessionToken);
            const authoritativeUserId = resolveProfileIdentity(profile);
            if (
                authoritativeUserId === null ||
                !isSameAccountIdentity(authoritativeUserId, userId)
            ) {
                await logout();
                throw new Error("Telegram authentication identity mismatch");
            }
            localStorage.setItem("userId", String(authoritativeUserId));
            const storedToken = getStorageItem("fcmToken");
            if (storedToken) {
                try {
                    await sendFcmToken(storedToken, authoritativeUserId);
                } catch {
                    // Notification registration is optional
                }
            }
            const successMessage = intl.formatMessage({
                id: "success",
                defaultMessage: "Success!",
            });
            toast.success(successMessage);
            setFeedback({ tone: "success", message: successMessage });
            router.push(destination);
            return true;
        }
        throw new Error("Telegram authentication was rejected");
    };

    const signInWithTelegram = async () => {
        if (busy) return;
        setBusy(true);
        setFeedback(null);
        try {
            // 1. Check if running inside Telegram Mini App with initData
            if (typeof window !== "undefined" && window.Telegram?.WebApp?.initData) {
                const initData = window.Telegram.WebApp.initData;
                if (typeof initData === "string" && initData.trim().length > 0) {
                    await handleMiniAppAuth(initData);
                    return;
                }
            }

            // 2. Official Telegram Auth flow via Telegram.Login.auth API
            const loaded = await loadTelegramScript();
            const botId = "8885467089";
            if (!botId) {
                console.error("NEXT_PUBLIC_TELEGRAM_BOT_ID is not set at build time");
                const domainTemplate = copy.auth.telegramDomainError || "Авторизация через Telegram временно недоступна для домена {domain}.";
                setFeedback({
                    tone: "danger",
                    message: domainTemplate.replace("{domain}", typeof window !== "undefined" ? window.location.hostname : "tezauksion.uz"),
                });
                setBusy(false);
                return;
            }

            if (!loaded || !window.Telegram?.Login) {
                console.error("Telegram Login script unavailable", { loaded });
                const domainTemplate = copy.auth.telegramDomainError
                    || "Авторизация через Telegram временно недоступна для домена {domain}.";
                setFeedback({
                    tone: "danger",
                    message: domainTemplate.replace(
                        "{domain}",
                        typeof window !== "undefined" ? window.location.hostname : "tezauksion.uz"
                    ),
                });
                setBusy(false);
                return;
            }

            window.Telegram.Login.auth(
                { bot_id: botId, request_access: "write" },
                async (user) => {
                    if (!user) {
                        setFeedback({
                            tone: "danger",
                            message: copy.auth.telegramPopupClosed || "Вход через Telegram отменен.",
                        });
                        setBusy(false);
                        return;
                    }
                    try {
                        await handleBackendAuth(user);
                    } catch (err) {
                        console.error("Telegram widget auth error:", err);
                        const serverMsg = err?.response?.data?.message || err?.response?.data?.detail || err?.message;
                        const serverTemplate = copy.auth.telegramServerError || "Ошибка сервера: {message}";
                        setFeedback({
                            tone: "danger",
                            message: serverMsg ? serverTemplate.replace("{message}", serverMsg) : serverTemplate.replace("{message}", "unknown"),
                        });
                    } finally {
                        setBusy(false);
                    }
                }
            );
        } catch (error) {
            console.error("Error signing in with Telegram:", error);
            const serverMsg = error?.response?.data?.message || error?.response?.data?.detail || error?.message;
            if (
                error?.message &&
                (error.message.includes("popup-closed") || error.message.includes("cancelled"))
            ) {
                setFeedback({
                    tone: "danger",
                    message: copy.auth.telegramPopupClosed || "Вход через Telegram отменен.",
                });
            } else if (serverMsg) {
                const serverTemplate = copy.auth.telegramServerError || "Ошибка сервера: {message}";
                setFeedback({
                    tone: "danger",
                    message: serverTemplate.replace("{message}", serverMsg),
                });
            } else {
                const currentDomain = typeof window !== "undefined" ? window.location.hostname : "tezauksion.uz";
                const domainTemplate = copy.auth.telegramDomainError || "Авторизация через Telegram временно недоступна для домена {domain}.";
                setFeedback({
                    tone: "danger",
                    message: domainTemplate.replace("{domain}", currentDomain),
                });
            }
            setBusy(false);
        }
    };

    return (
        <div className="w-full space-y-2">
            <button
                type="button"
                onClick={signInWithTelegram}
                disabled={busy}
                aria-busy={busy}
                className={`flex h-10 min-h-10 w-full gap-2 rounded-xl bg-[#54A9EB] hover:bg-[#4396D7] hover:shadow-md
                items-center justify-center px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm
                transition-all duration-200 ease-in-out cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54A9EB]${busy ? " opacity-60 !cursor-not-allowed" : ""}`}
            >
                {busy ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                    <>
                        <TelegramIcon aria-hidden="true" className="shrink-0" />
                        <span className="truncate min-w-0">
                            <FormattedMessage id="withTelegram" defaultMessage="Continue with Telegram" />
                        </span>
                    </>
                )}
            </button>
            {feedback ? (
                <p
                    aria-live={feedback.tone === "danger" ? "assertive" : "polite"}
                    className={`text-center text-xs font-semibold ${feedback.tone === "danger" ? "text-semantic-danger" : "text-semantic-success"}`}
                    role={feedback.tone === "danger" ? "alert" : "status"}
                >
                    {feedback.message}
                </p>
            ) : null}
        </div>
    );
};

export default TelegramLoginButton;
