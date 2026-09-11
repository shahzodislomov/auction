import { getStorageItem } from "@/utils/storage";
import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { api } from "@/api/api";
import { auth, provider } from "@/lib/firebase";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { sendFcmToken } from "@/queries/notifications";
import { FormattedMessage, useIntl } from "react-intl";
import { safeReturnPath } from "@/lib/navigation/safeReturnPath";
import { useTask6Copy } from "@/locales/task6";
import { isSameAccountIdentity, resolveProfileIdentity } from "@/lib/auth/profileIdentity";

function GoogleColorIcon() {
    return (
        <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24">
            <path d="M21.35 12.23c0-.71-.06-1.24-.2-1.8H12v3.47h5.37a4.62 4.62 0 0 1-1.99 2.95l-.02.12 2.89 2.24.2.02c1.84-1.7 2.9-4.2 2.9-7Z" fill="#4285F4" />
            <path d="M12 21.75c2.63 0 4.83-.87 6.44-2.52l-3.07-2.38c-.82.56-1.92.95-3.37.95a5.85 5.85 0 0 1-5.53-4.04l-.12.01-3 2.32-.04.11A9.72 9.72 0 0 0 12 21.75Z" fill="#34A853" />
            <path d="M6.47 13.76A5.95 5.95 0 0 1 6.15 12c0-.61.11-1.2.31-1.76v-.12L3.43 7.76l-.1.05A9.72 9.72 0 0 0 2.25 12c0 1.51.38 2.94 1.06 4.2l3.16-2.44Z" fill="#FBBC05" />
            <path d="M12 6.2c1.83 0 3.06.79 3.76 1.44l2.75-2.68A9.34 9.34 0 0 0 12 2.25 9.72 9.72 0 0 0 3.31 7.81l3.15 2.43A5.87 5.87 0 0 1 12 6.2Z" fill="#EA4335" />
        </svg>
    );
}

const GoogleLoginButton = ({ deviceId, returnTo = "/" }) => {
    const { login, logout } = useUserContext();
    const router = useRouter();
    const intl = useIntl();
    const copy = useTask6Copy();
    const [feedback, setFeedback] = useState(null);
    const [busy, setBusy] = useState(false);
    const destination = safeReturnPath(returnTo);

    const handleBackendAuth = async (idToken) => {
        const encodedToken = encodeURIComponent(idToken);
        const encodedDeviceId = deviceId ? encodeURIComponent(deviceId) : "";
        const requestUrl = `/auth/google?idToken=${encodedToken}&token=${encodedToken}${encodedDeviceId ? `&deviceId=${encodedDeviceId}` : ""}`;
        
        const res = await api.post(requestUrl, {
            idToken: idToken,
            token: idToken,
            id_token: idToken,
            deviceId: deviceId || ""
        });
        const response = res?.data;
        const sessionToken = response?.token || response?.data?.token;
        
        const rawData = response?.data;
        let userId = null;
        if (typeof rawData === "number" || typeof rawData === "string") {
            userId = rawData;
        } else if (rawData && typeof rawData === "object") {
            userId = rawData.id ?? rawData.userId ?? rawData.data;
        } else if (response?.userId) {
            userId = response.userId;
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
                throw new Error("Google authentication identity mismatch");
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
        throw new Error("Google authentication was rejected");
    };

    const signInWithGoogle = async () => {
        if (busy) return;
        setBusy(true);
        setFeedback(null);
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            await handleBackendAuth(idToken);
        } catch (error) {
            console.error("Error signing in with Firebase:", error);
            const isDomainError = error?.code === "auth/unauthorized-domain" || 
                (error?.message && error.message.includes("auth/unauthorized-domain"));

            if (isDomainError) {
                const currentDomain = typeof window !== "undefined" ? window.location.hostname : "tezauksion.uz";
                const domainTemplate = copy.auth.googleDomainError || "Авторизация через Google временно недоступна для домена {domain}. Воспользуйтесь входом по Email.";
                setFeedback({ 
                    tone: "danger", 
                    message: domainTemplate.replace("{domain}", currentDomain) 
                });
            } else if (
                error?.code === "auth/popup-closed-by-user" ||
                (error?.message && error.message.includes("popup-closed-by-user"))
            ) {
                setFeedback({ tone: "danger", message: copy.auth.googlePopupClosed || "Вход через Google отменен (окно закрыто)." });
            } else if (
                error?.code === "auth/popup-blocked" ||
                (error?.message && error.message.includes("popup-blocked"))
            ) {
                setFeedback({ tone: "danger", message: copy.auth.googlePopupBlocked || "Всплывающее окно заблокировано браузером. Разрешите всплывающие окна." });
            } else if (error?.response?.data?.message) {
                const serverTemplate = copy.auth.googleServerError || "Ошибка сервера: {message}";
                setFeedback({ tone: "danger", message: serverTemplate.replace("{message}", error.response.data.message) });
            } else {
                setFeedback({ tone: "danger", message: copy.auth.loginError });
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="w-full space-y-2">
            <button type="button" onClick={signInWithGoogle} disabled={busy} aria-busy={busy}
                className={`flex h-10 min-h-10 w-full gap-2 rounded-xl border border-border-default bg-surface-primary
                items-center justify-center px-3 py-1.5 text-xs sm:text-sm font-semibold text-brand-navy-900 hover:bg-surface-muted hover:shadow-sm
                transition-all duration-200 ease-in-out cursor-pointer active:scale-[0.99] whitespace-nowrap overflow-hidden text-ellipsis focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring${busy ? " opacity-60 !cursor-not-allowed" : ""}`}>
                <GoogleColorIcon />
                <span className="truncate min-w-0">
                    <FormattedMessage id="withGoogle" />
                </span>
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

export default GoogleLoginButton;
