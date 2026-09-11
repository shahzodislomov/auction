"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { api } from "@/api/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { OtpStep } from "@/components/auth/OtpStep";
import { Button } from "@/components/ui/Button";
import { safeReturnPath } from "@/lib/navigation/safeReturnPath";
import { useTask6Copy } from "@/locales/task6";
import { CheckCircle2, Eye, EyeOff, X } from "lucide-react";

const inputClass =
  "mt-2 min-h-12 w-full rounded-md border border-border-default bg-surface-primary px-3.5 text-base text-text-primary outline-none focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25";

export function loginHrefWithReturnTo(value: unknown): string {
  const destination = safeReturnPath(value);
  return destination === "/"
    ? "/login"
    : `/login?returnTo=${encodeURIComponent(destination)}`;
}

function ReturnToLoginLink({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const searchParams = useSearchParams();
  return (
    <Link
      className={className}
      href={loginHrefWithReturnTo(searchParams?.get("returnTo"))}
    >
      {children}
    </Link>
  );
}

export default function ForgotPasswordPage() {
  const copy = useTask6Copy();
  const [showPassword, setShowPassword] = useState(false);

  // Multi-step state
  // "email"   — Step 1: enter email and send OTP
  // "reset"   — Step 2: enter OTP + popup modal for new password
  // "complete"— Step 3: success
  const [step, setStep] = useState<"email" | "reset" | "complete">("email");

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccessCount, setResendSuccessCount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const getActiveLang = () => {
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
  };

  // --- Step 1: send OTP to email ---
  const sendOtp = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password/send-otp", {
        email: email.trim(),
        language: getActiveLang(),
      });
      setStep("reset");
      setResendSuccessCount((c) => c + 1);
    } catch (requestError) {
      const message = (
        requestError as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      setError(message || copy.auth.registerError);
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: typeof fieldErrors = {};
    if (!email.trim()) next.email = copy.auth.emailRequired;
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = copy.auth.emailInvalid;
    setFieldErrors(next);
    if (Object.keys(next).length === 0) void sendOtp();
  };

  // --- Step 2: verify OTP and reset password ---
  const resetPassword = async (code: string) => {
    const next: typeof fieldErrors = {};
    if (!newPassword || newPassword.length < 8) next.newPassword = copy.auth.passwordLength;
    if (confirmPassword !== newPassword) next.confirmPassword = copy.auth.passwordsMismatch;
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password/reset", {
        email: email.trim(),
        otp: code,
        newPassword,
      });
      setShowPasswordModal(false);
      setStep("complete");
    } catch (requestError) {
      const message = (
        requestError as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      setError(message || copy.auth.verifyError);
    } finally {
      setBusy(false);
    }
  };

  // --- Resend OTP ---
  const resendOtp = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password/send-otp", {
        email: email.trim(),
        language: getActiveLang(),
      });
      setResendSuccessCount((c) => c + 1);
    } catch (requestError) {
      const message = (
        requestError as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      setError(message || copy.auth.registerError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell mode="reset">
      {/* ── Step 1: Email entry ── */}
      {step === "email" ? (
        <form className="space-y-5" noValidate onSubmit={handleEmailSubmit}>
          <ResetField
            error={fieldErrors.email}
            id="reset-email"
            label={copy.auth.email}
            onChange={(value) => {
              setEmail(value);
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            type="email"
            value={email}
          />
          {error ? (
            <p className="rounded-md bg-semantic-danger-surface p-3 text-sm font-semibold text-semantic-danger" role="alert">
              {error}
            </p>
          ) : null}
          <Button disabled={busy} fullWidth size="large" type="submit">
            {busy ? copy.auth.working : copy.auth.sendCode}
          </Button>
          <p className="text-center text-sm text-text-secondary">
            <Suspense
              fallback={
                <Link
                  className="font-bold text-brand-navy-900 underline underline-offset-4"
                  href="/login"
                >
                  {copy.auth.loginLink}
                </Link>
              }
            >
              <ReturnToLoginLink className="font-bold text-brand-navy-900 underline underline-offset-4">
                {copy.auth.loginLink}
              </ReturnToLoginLink>
            </Suspense>
          </p>
        </form>
      ) : null}

      {/* ── Step 2: OTP entry ── */}
      {step === "reset" ? (
        <div className="space-y-5">
          <OtpStep
            email={email}
            error={error}
            isResending={busy}
            isVerifying={busy}
            resendSuccessCount={resendSuccessCount}
            onBack={() => {
              setStep("email");
              setError(null);
              setFieldErrors({});
              setShowPasswordModal(false);
            }}
            onResend={() => void resendOtp()}
            onVerify={(code) => {
              setOtpCode(code);
              setFieldErrors({});
              setError(null);
              setShowPasswordModal(true);
            }}
          />
        </div>
      ) : null}

      {/* ── Step 3: Success ── */}
      {step === "complete" ? (
        <div className="text-center">
          <CheckCircle2 aria-hidden="true" className="mx-auto text-semantic-success" size={42} />
          <p className="mt-4 font-semibold text-text-primary" role="status">
            {copy.auth.resetSuccess}
          </p>
          <Suspense
            fallback={
              <Link
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md border border-brand-champagne-500 bg-brand-champagne-500 px-6 font-bold text-brand-navy-900 hover:bg-brand-champagne-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                href="/login"
              >
                {copy.auth.login}
              </Link>
            }
          >
            <ReturnToLoginLink className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md border border-brand-champagne-500 bg-brand-champagne-500 px-6 font-bold text-brand-navy-900 hover:bg-brand-champagne-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
              {copy.auth.login}
            </ReturnToLoginLink>
          </Suspense>
        </div>
      ) : null}

      {/* ── Step 2 Popup Modal for New Password ── */}
      {showPasswordModal ? (
        <div
          aria-labelledby="reset-password-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border-default bg-surface-primary p-6 shadow-2xl transition-all md:p-8">
            <button
              aria-label="Close"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-focus-ring"
              onClick={() => {
                setShowPasswordModal(false);
                setError(null);
              }}
              type="button"
            >
              <X size={20} />
            </button>

            <h3
              className="text-xl font-bold text-text-primary"
              id="reset-password-modal-title"
            >
              {copy.auth.newPassword}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-text-secondary">
              {email}
            </p>

            {error ? (
              <p
                className="mt-4 rounded-md bg-semantic-danger-surface p-3 text-sm font-semibold text-semantic-danger"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <form
              className="mt-5 space-y-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void resetPassword(otpCode);
              }}
            >
              <ResetField
                error={fieldErrors.newPassword}
                id="modal-reset-new-password"
                label={copy.auth.newPassword}
                onChange={(value) => {
                  setNewPassword(value);
                  setFieldErrors((current) => ({ ...current, newPassword: undefined }));
                }}
                onTogglePassword={() => setShowPassword((v) => !v)}
                showPassword={showPassword}
                type="password"
                value={newPassword}
              />
              <ResetField
                error={fieldErrors.confirmPassword}
                id="modal-reset-confirm-password"
                label={copy.auth.confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                  setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
                }}
                onTogglePassword={() => setShowPassword((v) => !v)}
                showPassword={showPassword}
                type="password"
                value={confirmPassword}
              />

              <div className="pt-2">
                <Button disabled={busy} fullWidth size="large" type="submit">
                  {busy ? copy.auth.working : copy.auth.verifyCode}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AuthShell>
  );
}

function ResetField({
  error,
  id,
  label,
  onChange,
  type,
  value,
  showPassword,
  onTogglePassword,
}: {
  error?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  type: "email" | "password";
  value: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="relative">
      <label className="text-sm font-bold text-text-primary" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={type === "email" ? "email" : "new-password"}
        className={`${inputClass} ${type === "password" ? "pr-12" : ""}`}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        type={
          type === "password"
            ? showPassword
              ? "text"
              : "password"
            : "email"
        }
        value={value}
      />
      {error ? (
        <p className="mt-2 text-sm font-semibold text-semantic-danger" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
      {type === "password" && (
        <button
          type="button"
          onClick={onTogglePassword}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-1 top-2/3 mt-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus-ring"
        >
          {showPassword ? (
            <EyeOff aria-hidden="true" size={20} />
          ) : (
            <Eye aria-hidden="true" size={20} />
          )}
        </button>
      )}
    </div>
  );
}
