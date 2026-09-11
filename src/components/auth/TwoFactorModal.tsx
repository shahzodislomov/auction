"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  Check,
  Copy,
  Key,
  LoaderCircle,
  QrCode,
  ShieldCheck,
  X,
} from "lucide-react";
import { LangSwitch } from "@/context/LangSwitch";
import { useSetupTwoFactor, useVerifyTwoFactor } from "@/queries/auth2fa";

interface TwoFactorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const copyTexts = {
  uz: {
    title: "Google Authenticator (2FA) ulash",
    subtitle:
      "Hisobingiz xavfsizligini oshirish uchun ikki bosqichli tasdiqlashni yoqing.",
    step1: "1-qadam: QR-kodni skanerlang",
    step1Desc:
      "Telefoningizdagi Google Authenticator yoki boshqa 2FA ilovasini oching va ushbu QR-kodni skanerlang.",
    manualKeyText: "Yoki ushbu maxfiy kalitni ilovaga qo'lda kiriting:",
    copied: "Nusxalandi!",
    copyKey: "Kalitdan nusxa olish",
    step2: "2-qadam: 6 xonali tasdiqlash kodini kiriting",
    codePlaceholder: "000000",
    verifyBtn: "Tasdiqlash va yoqish",
    verifying: "Tekshirilmoqda...",
    successTitle: "2FA muvaffaqiyatli ulandi!",
    successBody:
      "Endi har safar hisobingizga kirishda Google Authenticator ilovasidagi kod talab qilinadi.",
    close: "Yopish",
    loadError: "2FA ma'lumotlarini yuklashda xatolik yuz berdi.",
    retry: "Qayta urinish",
    verifyError: "Noto'g'ri kod kiritildi. Iltimos, qaytadan tekshirib ko'ring.",
  },
  ru: {
    title: "Подключение Google Authenticator (2FA)",
    subtitle:
      "Включите двухфакторную аутентификацию для максимальной защиты аккаунта.",
    step1: "Шаг 1: Отсканируйте QR-код",
    step1Desc:
      "Откройте приложение Google Authenticator на телефоне и отсканируйте QR-код.",
    manualKeyText: "Или введите этот секретный ключ в приложение вручную:",
    copied: "Скопировано!",
    copyKey: "Скопировать ключ",
    step2: "Шаг 2: Введите 6-значный код из приложения",
    codePlaceholder: "000000",
    verifyBtn: "Подтвердить и включить",
    verifying: "Проверка...",
    successTitle: "2FA успешно подключена!",
    successBody:
      "Теперь при каждом входе в аккаунт будет запрашиваться 6-значный код из приложения.",
    close: "Закрыть",
    loadError: "Не удалось получить данные для настройки 2FA.",
    retry: "Повторить",
    verifyError: "Неверный код подтверждения. Пожалуйста, попробуйте снова.",
  },
  en: {
    title: "Connect Google Authenticator (2FA)",
    subtitle: "Enable two-factor authentication to protect your account and bids.",
    step1: "Step 1: Scan QR code",
    step1Desc:
      "Open Google Authenticator app on your phone and scan this QR code.",
    manualKeyText: "Or enter this secret key manually into the app:",
    copied: "Copied!",
    copyKey: "Copy key",
    step2: "Step 2: Enter 6-digit confirmation code",
    codePlaceholder: "000000",
    verifyBtn: "Confirm and enable",
    verifying: "Verifying...",
    successTitle: "2FA successfully enabled!",
    successBody:
      "Now a 6-digit code from Google Authenticator will be required on each login.",
    close: "Close",
    loadError: "Failed to load 2FA setup details.",
    retry: "Retry",
    verifyError: "Invalid confirmation code. Please check and try again.",
  },
};

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { currentLang } = useContext(LangSwitch);
  const t = copyTexts[currentLang as "uz" | "ru" | "en"] ?? copyTexts.uz;

  const setupMutation = useSetupTwoFactor();
  const verifyMutation = useVerifyTwoFactor();

  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setupMutate = setupMutation.mutate;
  const hasSetupData = Boolean(setupMutation.data);
  const isSetupPending = setupMutation.isPending;

  useEffect(() => {
    if (open && !hasSetupData && !isSetupPending && !isSuccess) {
      setupMutate();
    }
  }, [open, hasSetupData, isSetupPending, isSuccess, setupMutate]);

  const handleClose = () => {
    setCode("");
    setIsSuccess(false);
    setErrorMessage(null);
    setCopied(false);
    onClose();
  };

  if (!open) return null;

  const data = setupMutation.data;
  const secretKey =
    typeof data?.secret === "string"
      ? data.secret
      : typeof data?.manualKey === "string"
      ? data.manualKey
      : "";

  const qrSrc =
    typeof data?.qrCodeUrl === "string"
      ? data.qrCodeUrl
      : typeof data?.qrCode === "string"
      ? data.qrCode.startsWith("data:") || data.qrCode.startsWith("http")
        ? data.qrCode
        : `data:image/png;base64,${data.qrCode}`
      : typeof data?.otpauthUrl === "string"
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          data.otpauthUrl,
        )}`
      : secretKey
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          `otpauth://totp/TezAuction:${encodeURIComponent(
            secretKey,
          )}?secret=${secretKey}&issuer=TezAuction`,
        )}`
      : "";

  const handleCopySecret = async () => {
    if (!secretKey) return;
    try {
      await navigator.clipboard.writeText(secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failure
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) return;
    setErrorMessage(null);

    verifyMutation.mutate(
      { code: code.trim() },
      {
        onSuccess: () => {
          setIsSuccess(true);
          onSuccess?.();
        },
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { message?: string } };
            message?: string;
          } | null;
          setErrorMessage(
            axiosErr?.response?.data?.message ||
              axiosErr?.message ||
              t.verifyError,
          );
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-border-default">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default px-6 py-4 bg-surface-muted/50">
          <div className="flex items-center gap-2.5 text-brand-navy-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy-50 text-brand-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">{t.title}</h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-semantic-success/10 text-semantic-success">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy-900">
                {t.successTitle}
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                {t.successBody}
              </p>
              <button
                onClick={handleClose}
                className="mt-4 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors"
              >
                {t.close}
              </button>
            </div>
          ) : setupMutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <LoaderCircle className="h-8 w-8 animate-spin text-brand-primary" />
              <p className="text-sm text-text-secondary">
                {currentLang === "uz"
                  ? "Xavfsizlik kaliti yaratilmoqda..."
                  : "Генерация ключей безопасности..."}
              </p>
            </div>
          ) : setupMutation.isError ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-semantic-danger font-medium">
                {t.loadError}
              </p>
              <button
                onClick={() => setupMutation.mutate()}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-surface-muted text-sm font-semibold hover:bg-surface-primary transition-colors"
              >
                {t.retry}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-xs text-text-secondary">{t.subtitle}</p>

              {/* Step 1: QR and Manual key */}
              <div className="rounded-xl border border-border-default bg-surface-muted/30 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy-900 flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-brand-primary" />
                  {t.step1}
                </h4>
                <p className="text-xs text-text-secondary">{t.step1Desc}</p>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  {qrSrc ? (
                    <div className="flex h-36 w-36 items-center justify-center rounded-lg border border-border-default bg-white p-2 shadow-sm shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrSrc}
                        alt="2FA QR Code"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : null}

                  {secretKey ? (
                    <div className="flex-1 w-full space-y-1.5">
                      <span className="text-[11px] text-text-muted">
                        {t.manualKeyText}
                      </span>
                      <div className="flex items-center gap-2 rounded-lg border border-border-default bg-white px-3 py-2">
                        <Key className="h-4 w-4 text-text-muted shrink-0" />
                        <span className="font-mono text-xs font-semibold text-brand-navy-900 break-all select-all">
                          {secretKey}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="ml-auto rounded p-1 text-text-secondary hover:text-brand-primary transition-colors shrink-0"
                          title={t.copyKey}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-semantic-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {copied && (
                        <span className="text-[11px] font-semibold text-semantic-success">
                          {t.copied}
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Step 2: Confirmation code */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-navy-900">
                    {t.step2}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder={t.codePlaceholder}
                    className="w-full rounded-xl border border-border-default px-4 py-2.5 text-center font-mono text-xl font-bold tracking-widest text-brand-navy-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs font-semibold text-semantic-danger">
                    {errorMessage}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    disabled={code.length !== 6 || verifyMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {verifyMutation.isPending ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        {t.verifying}
                      </>
                    ) : (
                      t.verifyBtn
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
