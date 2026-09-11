"use client";

import React, { useContext, useState } from "react";
import {
  Globe,
  Laptop,
  LoaderCircle,
  LogOut,
  Shield,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { LangSwitch } from "@/context/LangSwitch";
import {
  useAuthSessions,
  useRevokeAuthSession,
  useRevokeOtherAuthSessions,
} from "@/queries/authSessions";
import { TwoFactorModal } from "@/components/auth/TwoFactorModal";

const copyTexts = {
  uz: {
    securityTitle: "Xavfsizlik va kirishlar",
    securitySubtitle: "Ikki bosqichli himoya (2FA) va faol qurilmalarni boshqarish.",
    twoFaTitle: "Google Authenticator (2FA)",
    twoFaDesc:
      "Har safar hisobga kirishda mobil ilovadagi bir martalik 6 xonali kod bilan tasdiqlash.",
    connect2fa: "2FA ulash",
    sessionsTitle: "Faol qurilmalar va sessiyalar",
    sessionsDesc:
      "Ushbu profilga hozirda ulangan barcha qurilmalar va brauzerlar.",
    currentDevice: "Joriy qurilma",
    revokeOthers: "Boshqa qurilmalardan chiqish",
    revokingOthers: "Chiqarilmoqda...",
    revokeSingle: "Chiqarish",
    noSessions: "Boshqa faol sessiyalar topilmadi.",
    ipLabel: "IP:",
    lastActive: "Oxirgi faollik:",
    sessionsError: "Sessiyalar ro'yxatini yuklab bo'lmadi.",
  },
  ru: {
    securityTitle: "Безопасность и сессии",
    securitySubtitle: "Двухфакторная защита (2FA) и управление активными устройствами.",
    twoFaTitle: "Google Authenticator (2FA)",
    twoFaDesc:
      "Подтверждение входа одноразовым 6-значным кодом из мобильного приложения.",
    connect2fa: "Подключить 2FA",
    sessionsTitle: "Активные сессии и устройства",
    sessionsDesc:
      "Список всех устройств и браузеров, вошедших в ваш аккаунт.",
    currentDevice: "Текущее устройство",
    revokeOthers: "Выйти со всех других устройств",
    revokingOthers: "Выход...",
    revokeSingle: "Отозвать",
    noSessions: "Других активных сессий не найдено.",
    ipLabel: "IP:",
    lastActive: "Активность:",
    sessionsError: "Не удалось загрузить список активных сессий.",
  },
  en: {
    securityTitle: "Security & Sessions",
    securitySubtitle: "Two-factor authentication (2FA) and active devices control.",
    twoFaTitle: "Google Authenticator (2FA)",
    twoFaDesc:
      "Protect your account with a one-time 6-digit code from your authenticator app.",
    connect2fa: "Connect 2FA",
    sessionsTitle: "Active Devices & Sessions",
    sessionsDesc: "All devices and browsers currently signed in to your account.",
    currentDevice: "Current device",
    revokeOthers: "Log out from other devices",
    revokingOthers: "Logging out...",
    revokeSingle: "Revoke",
    noSessions: "No other active sessions found.",
    ipLabel: "IP:",
    lastActive: "Last active:",
    sessionsError: "Failed to load active sessions.",
  },
};

interface AuthSessionItem {
  id?: string | number;
  sessionId?: string | number;
  deviceName?: string;
  device?: string;
  userAgent?: string;
  browser?: string;
  ip?: string;
  ipAddress?: string;
  lastActive?: string;
  lastActivity?: string;
  lastActivityAt?: string;
  createdAt?: string;
  updatedAt?: string;
  current?: boolean;
  isCurrent?: boolean;
  currentSession?: boolean;
}

interface RawSessionsResponse {
  sessions?: AuthSessionItem[];
}

export const CabinetSecuritySection: React.FC = () => {
  const { currentLang } = useContext(LangSwitch);
  const t = copyTexts[currentLang as "uz" | "ru" | "en"] ?? copyTexts.uz;

  const [twoFaModalOpen, setTwoFaModalOpen] = useState(false);

  const { data: rawSessions, isLoading, error } = useAuthSessions();
  const revokeSessionMutation = useRevokeAuthSession();
  const revokeOthersMutation = useRevokeOtherAuthSessions();

  const sessionsList: AuthSessionItem[] = Array.isArray(rawSessions)
    ? (rawSessions as AuthSessionItem[])
    : Array.isArray((rawSessions as RawSessionsResponse | undefined)?.sessions)
    ? ((rawSessions as RawSessionsResponse).sessions as AuthSessionItem[])
    : [];

  return (
    <div className="mt-8 space-y-6 pt-8 border-t border-border-default">
      <div>
        <h3 className="text-lg font-bold text-brand-navy-900">
          {t.securityTitle}
        </h3>
        <p className="text-sm text-text-secondary">{t.securitySubtitle}</p>
      </div>

      {/* 2FA Card */}
      <div className="rounded-2xl border border-border-default bg-surface-primary p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy-50 text-brand-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-navy-900">
                {t.twoFaTitle}
              </h4>
              <p className="mt-0.5 text-xs text-text-secondary max-w-lg">
                {t.twoFaDesc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTwoFaModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-primary/90 transition-colors shrink-0"
          >
            <Shield className="h-4 w-4" />
            {t.connect2fa}
          </button>
        </div>
      </div>

      {/* Sessions Management */}
      <div className="rounded-2xl border border-border-default bg-surface-primary p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-default pb-4">
          <div>
            <h4 className="text-sm font-bold text-brand-navy-900">
              {t.sessionsTitle}
            </h4>
            <p className="text-xs text-text-secondary">{t.sessionsDesc}</p>
          </div>
          <button
            type="button"
            disabled={revokeOthersMutation.isPending}
            onClick={() => revokeOthersMutation.mutate()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-semantic-danger/30 bg-semantic-danger/5 px-3 py-1.5 text-xs font-semibold text-semantic-danger hover:bg-semantic-danger/10 disabled:opacity-50 transition-colors shrink-0"
          >
            {revokeOthersMutation.isPending ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            {revokeOthersMutation.isPending ? t.revokingOthers : t.revokeOthers}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-text-secondary gap-2">
            <LoaderCircle className="h-5 w-5 animate-spin text-brand-primary" />
            <span className="text-xs">Yuklanmoqda...</span>
          </div>
        ) : error ? (
          <p className="text-xs text-text-secondary py-2">{t.sessionsError}</p>
        ) : sessionsList.length === 0 ? (
          <p className="text-xs text-text-secondary py-2">{t.noSessions}</p>
        ) : (
          <div className="space-y-3 pt-1">
            {sessionsList.map((session: AuthSessionItem, idx: number) => {
              const isCurrent = Boolean(
                session.current ||
                  session.isCurrent ||
                  session.currentSession,
              );
              const deviceName =
                session.deviceName ||
                session.device ||
                session.userAgent ||
                session.browser ||
                "Qurilma / Device";
              const ipAddress = session.ip || session.ipAddress;
              const lastActive =
                session.lastActive ||
                session.lastActivity ||
                session.createdAt;

              const isMobile =
                /android|iphone|ipad|mobile/i.test(deviceName);

              return (
                <div
                  key={session.id ?? session.sessionId ?? `session-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border-default/80 bg-surface-muted/30 p-3.5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-border-default text-text-secondary">
                      {isMobile ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Laptop className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-navy-900">
                          {deviceName}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center rounded-full bg-semantic-success/15 px-2 py-0.5 text-[10px] font-bold text-semantic-success">
                            {t.currentDevice}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[11px] text-text-secondary">
                        {ipAddress && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {ipAddress}
                          </span>
                        )}
                        {lastActive && (
                          <span>
                            {t.lastActive} {String(lastActive)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isCurrent && session.id && (
                    <button
                      type="button"
                      disabled={revokeSessionMutation.isPending}
                      onClick={() =>
                        revokeSessionMutation.mutate(session.id)
                      }
                      className="self-end sm:self-auto rounded-lg border border-border-default bg-white px-2.5 py-1 text-xs font-medium text-text-secondary hover:border-semantic-danger/40 hover:text-semantic-danger transition-colors"
                    >
                      {t.revokeSingle}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2FA Modal */}
      <TwoFactorModal
        open={twoFaModalOpen}
        onClose={() => setTwoFaModalOpen(false)}
      />
    </div>
  );
};
