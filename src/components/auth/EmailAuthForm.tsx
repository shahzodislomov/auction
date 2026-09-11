"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { useUserContext } from "@/context/UserContext";
import { useTask6Copy } from "@/locales/task6";
import { safeReturnPath } from "@/lib/navigation/safeReturnPath";
import {
  isSameAccountIdentity,
  resolveProfileIdentity,
  type AuthenticatedProfileIdentity,
} from "@/lib/auth/profileIdentity";
import {
  useCheckCodeMutation,
  useLoginMutation,
  useRegisterMutation,
  useReVerfMutation,
  useVerfMutation,
} from "@/queries/index";
/// anything
import { sendFcmToken } from "@/queries/notifications";

import { OtpStep } from "./OtpStep";
import GoogleLoginButton from "@/app/(_components)/auth/GoogleLog";
import TelegramLoginButton from "@/app/(_components)/auth/TelegramLog";

type AuthMode = "login" | "register";
type AccountType = "individual" | "organization";
type RegisterChannel = "email" | "phone";

interface AuthFields {
  accountType: AccountType;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

type FieldError = Partial<Record<keyof AuthFields, string>>;

interface OtpRequest {
  flow: AuthMode;
  userId: string | number;
}

interface MutationError {
  response?: { data?: { message?: string } };
  message?: string;
}

interface MutationHandle<Payload> {
  mutate: (payload: Payload) => void;
  isPending?: boolean;
}

type RegisterPayload =
  | {
      channel: "email";
      deviceId: string;
      email: string;
      firstname: string;
      lastname: string;
      password: string;
    }
  | {
      channel: "phone";
      deviceId: string;
      password: string;
      phone: string;
    };

export interface EmailAuthFormProps {
  mode: AuthMode;
  returnTo?: string;
}

const inputClass =
  "mt-2 min-h-12 w-full rounded-md border border-border-default bg-surface-primary px-3.5 text-base text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25";

function localizeKnownAuthMessage(message: string | undefined, fallback: string): string {
  if (!message || message.trim().toUpperCase() === "SUCCESS") return fallback;
  const lower = message.trim().toLowerCase();
  if (
    lower.includes("email is already exist") ||
    lower.includes("email already exist") ||
    lower.includes("email already registered") ||
    lower.includes("user already exist") ||
    lower.includes("email_already_exist") ||
    lower.includes("email_already_exists")
  ) {
    return "Bu email allaqachon ro'yxatdan o'tgan. Iltimos, hisobga kiring.";
  }
  if (
    lower.includes("не удалось войти") ||
    lower.includes("email yoki parol") ||
    lower.includes("пароль") ||
    lower.includes("bad_request") ||
    lower.includes("login failed") ||
    lower.includes("invalid credentials") ||
    lower.includes("unexpected error") ||
    lower.includes("http_500") ||
    lower.includes("user not found")
  ) {
    return fallback;
  }
  return message;
}

function mutationMessage(error: unknown, fallback: string): string {
  const candidate = error as MutationError;
  const raw = candidate.response?.data?.message || candidate.message;
  return localizeKnownAuthMessage(raw, fallback);
}

function hasExplicitAuthFailure(status: string | undefined): boolean {
  if (typeof status !== "string") return false;
  const normalized = status.trim().toUpperCase();
  return normalized !== "OK" && normalized !== "SUCCESS";
}

function explicitAuthFailureMessage(
  message: string | undefined,
  fallback: string,
): string {
  return localizeKnownAuthMessage(message, fallback);
}

function isLikelyJwt(value: string | undefined): value is string {
  return typeof value === "string" && value.split(".").length === 3;
}

function readOrCreateDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  const existing = window.localStorage.getItem("deviceId");
  if (existing) return existing;
  const created = `device-${Math.random().toString(36).slice(2, 11)}`;
  window.localStorage.setItem("deviceId", created);
  return created;
}

function authHref(path: string, destination: string): string {
  return destination === "/"
    ? path
    : `${path}?returnTo=${encodeURIComponent(destination)}`;
}

export function EmailAuthForm({ mode, returnTo }: EmailAuthFormProps) {
  const copy = useTask6Copy();
  const router = useRouter();
  const { login, logout } = useUserContext() as unknown as {
    login: (token: string) => Promise<AuthenticatedProfileIdentity>;
    logout: () => Promise<void> | void;
  };
  const destination = safeReturnPath(returnTo);
  const postRegisterDestination = destination === "/" ? "/dashboard" : destination;
  const [deviceId] = useState<string | null>(readOrCreateDeviceId);
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState<AuthFields>({
    accountType: "individual",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [registerChannel, setRegisterChannel] = useState<RegisterChannel>("email");
  const [errors, setErrors] = useState<FieldError>({});
  const [operationError, setOperationError] = useState<string | null>(null);
  const [otpRequest, setOtpRequest] = useState<OtpRequest | null>(null);
  const [resendSuccessCount, setResendSuccessCount] = useState(0);

  const completeLogin = async (
    token: string,
    userId?: string | number,
    fallbackError = copy.auth.loginError,
    successDestination = destination,
  ) => {
    try {
      const profile = await login(token);
      const authoritativeUserId = resolveProfileIdentity(profile);
      if (
        authoritativeUserId === null ||
        (userId !== undefined &&
          !isSameAccountIdentity(authoritativeUserId, userId))
      ) {
        await logout();
        throw new Error(fallbackError);
      }
      window.localStorage.setItem("userId", String(authoritativeUserId));
      const fcmToken = window.localStorage.getItem("fcmToken");
      if (fcmToken) {
        try {
          await sendFcmToken(fcmToken, authoritativeUserId);
        } catch {
          // Authentication is complete even when optional notification registration fails.
        }
      }
      router.push(successDestination);
    } catch (error) {
      window.localStorage.removeItem("userId");
      setOperationError(mutationMessage(error, fallbackError));
    }
  };

  const loginMutation = useLoginMutation(
    (response: {
      code?: number;
      data?: string | number;
      message?: string;
      status?: string;
    }) => {
      if (hasExplicitAuthFailure(response.status)) {
        setOperationError(
          explicitAuthFailureMessage(response.message, copy.auth.loginError),
        );
        return;
      }
      if (response.code === 0 && response.data !== undefined) {
        setOtpRequest({ flow: "login", userId: response.data });
        setOperationError(null);
        return;
      }
      if (response.code === 1 && response.message) {
        void completeLogin(response.message, response.data);
        return;
      }
      setOperationError(response.message || copy.auth.loginError);
    },
    (error: unknown) => setOperationError(mutationMessage(error, copy.auth.loginError)),
  ) as unknown as MutationHandle<{ deviceId: string; email: string; password: string }>;

  const registerMutation = useRegisterMutation(
    (response: {
      status?: string;
      message?: string;
      data?: { token?: string; userId?: string | number; user?: { id?: string | number } };
      meta?: { userId?: string | number };
    }) => {
      if (hasExplicitAuthFailure(response.status)) {
        setOperationError(
          explicitAuthFailureMessage(response.message, copy.auth.registerError),
        );
        return;
      }
      // If the backend directly returned a JWT token, log the user in immediately
      const registrationToken = response.data?.token ?? (
        isLikelyJwt(response.message) ? response.message : undefined
      );
      if (registrationToken) {
        void completeLogin(
          registrationToken,
          response.data?.user?.id,
          copy.auth.registerError,
          postRegisterDestination,
        );
        return;
      }
      // New API: backend auto-sends OTP — show OTP step.
      // Accept success with or without an explicit userId in the response.
      const userId = response.data?.userId ?? response.data?.user?.id ?? response.meta?.userId ?? "";
      setOtpRequest({ flow: "register", userId });
      setOperationError(null);
    },
    (error: unknown) =>
      setOperationError(mutationMessage(error, copy.auth.registerError)),
  ) as unknown as MutationHandle<RegisterPayload>;

  const verifyRegistration = useVerfMutation(
    (response: {
      status?: string;
      message?: string;
      data?: { token?: string; user?: { id?: string | number } };
    }) => {
      // New endpoint /auth/register/email/verify-otp returns a token on success
      const token = response.data?.token ?? (
        isLikelyJwt(response.message) ? response.message : undefined
      );
      if (token) {
        void completeLogin(
          token,
          response.data?.user?.id ?? otpRequest?.userId,
          copy.auth.verifyError,
          postRegisterDestination,
        );
        return;
      }
      setOperationError(response.message || copy.auth.verifyError);
    },
    (error: unknown) => setOperationError(mutationMessage(error, copy.auth.verifyError)),
  ) as unknown as MutationHandle<{
    code: string;
    email: string;
  }>;

  const verifyLogin = useCheckCodeMutation(
    (response: {
      status?: string;
      message?: string;
      data?: { token?: string };
    }) => {
      if (hasExplicitAuthFailure(response.status)) {
        setOperationError(
          explicitAuthFailureMessage(response.message, copy.auth.verifyError),
        );
        return;
      }
      if (response.message === "SUCCESS" && response.data?.token) {
        void completeLogin(
          response.data.token,
          otpRequest?.userId,
          copy.auth.verifyError,
        );
        return;
      }
      setOperationError(response.message || copy.auth.verifyError);
    },
    (error: unknown) => setOperationError(mutationMessage(error, copy.auth.verifyError)),
  ) as unknown as MutationHandle<{
    code: string;
    deviceId: string | null;
    email: string;
    id: string | number;
  }>;

  const resendMutation = useReVerfMutation(
    (response: { status?: string; message?: string }) => {
      if (response.status !== "OK") {
        setOperationError(response.message || copy.auth.verifyError);
        return;
      }
      setOperationError(null);
      setResendSuccessCount((count) => count + 1);
    },
    (error: unknown) => setOperationError(mutationMessage(error, copy.auth.verifyError)),
  ) as unknown as MutationHandle<{ email: string; userId: string | number }>;

  const setField = <Key extends keyof AuthFields>(key: Key, value: AuthFields[Key]) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setOperationError(null);
  };

  const validate = (): boolean => {
    const next: FieldError = {};
    if (mode === "login" || registerChannel === "email") {
      if (!fields.email.trim()) next.email = copy.auth.emailRequired;
      else if (!/^\S+@\S+\.\S+$/.test(fields.email)) next.email = copy.auth.emailInvalid;
    }
    if (!fields.password) next.password = copy.auth.passwordRequired;
    if (mode === "register") {
      if (registerChannel === "email") {
        if (!fields.firstName.trim()) next.firstName = copy.auth.firstNameRequired;
        if (!fields.lastName.trim()) next.lastName = copy.auth.lastNameRequired;
      }
      if (registerChannel === "phone") {
        if (!fields.phone.trim()) next.phone = copy.auth.phoneRequired;
        else if (!/^\d{9}$/.test(fields.phone.replace(/\D/g, ""))) {
          next.phone = copy.auth.phoneInvalid;
        }
      }
      if (fields.password.length < 8) next.password = copy.auth.passwordLength;
      if (fields.confirmPassword !== fields.password) {
        next.confirmPassword = copy.auth.passwordsMismatch;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    const activeDeviceId = deviceId ?? readOrCreateDeviceId();
    if (!activeDeviceId) {
      setOperationError(copy.auth.missingDevice);
      return;
    }
    if (mode === "login") {
      loginMutation.mutate({
        deviceId: activeDeviceId,
        email: fields.email.trim(),
        password: fields.password,
      });
      return;
    }
    if (registerChannel === "phone") {
      registerMutation.mutate({
        channel: "phone",
        deviceId: activeDeviceId,
        password: fields.password,
        phone: fields.phone.replace(/\D/g, ""),
      });
      return;
    }

    registerMutation.mutate({
      channel: "email",
      deviceId: activeDeviceId,
      email: fields.email.trim(),
      firstname: fields.firstName.trim(),
      lastname: fields.lastName.trim(),
      password: fields.password,
    });
  };

  const handleVerify = (code: string) => {
    if (!otpRequest) return;
    setOperationError(null);
    if (otpRequest.flow === "login") {
      verifyLogin.mutate({
        code,
        deviceId: deviceId ?? readOrCreateDeviceId(),
        email: fields.email.trim(),
        id: otpRequest.userId,
      });
      return;
    }
    // New registration verify: only email + code needed
    verifyRegistration.mutate({
      code,
      email: fields.email.trim(),
    });
  };

  if (otpRequest) {
    return (
      <OtpStep
        email={fields.email}
        error={operationError}
        isResending={Boolean(resendMutation.isPending)}
        isVerifying={Boolean(verifyLogin.isPending || verifyRegistration.isPending)}
        resendSuccessCount={resendSuccessCount}
        onBack={() => {
          setOtpRequest(null);
          setOperationError(null);
        }}
        onResend={() => {
          setOperationError(null);
          resendMutation.mutate({
            email: fields.email.trim(),
            userId: otpRequest.userId,
          });
        }}
        onVerify={handleVerify}
      />
    );
  }

  const busy = Boolean(loginMutation.isPending || registerMutation.isPending);

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      {mode === "register" ? (
        <fieldset>
          <legend className="text-sm font-bold text-text-primary">Registration method</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(["email", "phone"] as const).map((channel) => (
              <label
                key={channel}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3.5 font-semibold transition-colors ${
                  registerChannel === channel
                    ? "border-brand-navy-900 bg-surface-muted text-brand-navy-900"
                    : "border-border-default bg-surface-primary text-text-secondary"
                }`}
              >
                <input
                  checked={registerChannel === channel}
                  className="size-4 accent-brand-navy-900"
                  name="registerChannel"
                  onChange={() => {
                    setRegisterChannel(channel);
                    setErrors({});
                    setOperationError(null);
                  }}
                  type="radio"
                />
                {channel === "email" ? "Register by email" : "Register by phone"}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {mode === "register" ? (
        <fieldset>
          <legend className="text-sm font-bold text-text-primary">{copy.auth.accountType}</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(["individual", "organization"] as const).map((accountType) => (
              <label
                key={accountType}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3.5 font-semibold transition-colors ${
                  fields.accountType === accountType
                    ? "border-brand-navy-900 bg-surface-muted text-brand-navy-900"
                    : "border-border-default bg-surface-primary text-text-secondary"
                }`}
              >
                <input
                  checked={fields.accountType === accountType}
                  className="size-4 accent-brand-navy-900"
                  name="accountType"
                  onChange={() => setField("accountType", accountType)}
                  type="radio"
                />
                {accountType === "individual" ? copy.auth.individual : copy.auth.organization}
              </label>
            ))}
          </div>
          {fields.accountType === "organization" ? (
            <p className="mt-3 rounded-md border border-semantic-warning/30 bg-semantic-warning-surface p-3 text-sm leading-6 text-text-primary">
              {copy.auth.organizationNote}
            </p>
          ) : null}
        </fieldset>
      ) : null}

      {mode === "register" && registerChannel === "email" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            error={errors.firstName}
            id="auth-first-name"
            label={copy.auth.firstName}
            onChange={(value) => setField("firstName", value)}
            value={fields.firstName}
          />
          <Field
            error={errors.lastName}
            id="auth-last-name"
            label={copy.auth.lastName}
            onChange={(value) => setField("lastName", value)}
            value={fields.lastName}
          />
        </div>
      ) : null}

      {mode === "register" && registerChannel === "phone" ? (
        <div>
          <label className="text-sm font-bold text-text-primary" htmlFor="auth-phone">
            {copy.auth.phone}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-text-secondary">
              +998
            </span>
            <input
              aria-describedby={errors.phone ? "auth-phone-error" : undefined}
              aria-invalid={Boolean(errors.phone)}
              autoComplete="tel-national"
              className={`${inputClass} pl-14`}
              id="auth-phone"
              inputMode="tel"
              maxLength={9}
              onChange={(event) => setField("phone", event.target.value.replace(/\D/g, ""))}
              type="tel"
              value={fields.phone}
            />
          </div>
          <FieldError id="auth-phone-error" message={errors.phone} />
        </div>
      ) : null}

      {mode === "login" || registerChannel === "email" ? (
        <Field
          autoComplete="email"
          error={errors.email}
          id="auth-email"
          label={copy.auth.email}
          onChange={(value) => setField("email", value)}
          type="email"
          value={fields.email}
        />
      ) : null}

      <div>
        <label className="text-sm font-bold text-text-primary" htmlFor="auth-password">
          {copy.auth.password}
        </label>
        <div className="relative">
          <input
            aria-describedby={errors.password ? "auth-password-error" : undefined}
            aria-invalid={Boolean(errors.password)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={`${inputClass} pr-12`}
            id="auth-password"
            onChange={(event) => setField("password", event.target.value)}
            type={showPassword ? "text" : "password"}
            value={fields.password}
          />
          <button
            aria-label={showPassword ? copy.auth.hidePassword : copy.auth.showPassword}
            className="absolute right-1 top-1/2 mt-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus-ring"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? <EyeOff aria-hidden="true" size={20} /> : <Eye aria-hidden="true" size={20} />}
          </button>
        </div>
        <FieldError id="auth-password-error" message={errors.password} />
      </div>

      {mode === "register" ? (
        <Field
          autoComplete="new-password"
          error={errors.confirmPassword}
          id="auth-confirm-password"
          label={copy.auth.confirmPassword}
          onChange={(value) => setField("confirmPassword", value)}
          type={showPassword ? "text" : "password"}
          value={fields.confirmPassword}
        />
      ) : null}

      {operationError ? (
        <p className="rounded-md border border-semantic-danger/30 bg-semantic-danger-surface p-3 text-sm font-semibold text-semantic-danger" role="alert">
          {operationError}
        </p>
      ) : null}

      {destination !== "/" ? (
        <p className="rounded-md bg-semantic-info-surface p-3 text-sm text-text-primary">
          {copy.auth.returnToTask.replace("{path}", destination)}
        </p>
      ) : null}

      <Button disabled={busy} fullWidth size="large" type="submit">
        {busy ? copy.auth.working : mode === "login" ? copy.auth.login : copy.auth.createAccount}
      </Button>

      <div className="pt-2">
        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-border-default w-full" />
          <span className="bg-surface-primary px-3 text-xs font-semibold uppercase tracking-wider text-text-secondary absolute">
            {copy.auth.or}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 my-5">
          <GoogleLoginButton deviceId={deviceId || ""} returnTo={destination} />
          <TelegramLoginButton deviceId={deviceId || ""} returnTo={destination} />
        </div>
      </div>

      <div className="space-y-2 text-center text-sm text-text-secondary">
        {mode === "login" ? (
          <>
            <p>
              {copy.auth.forgotPrompt}{" "}
              <Link className="font-bold text-brand-gold-text underline underline-offset-4" href={authHref("/forgot-password", destination)}>
                {copy.auth.forgotLink}
              </Link>
            </p>
            <Link className="font-bold text-brand-gold-text underline underline-offset-4" href={authHref("/register", destination)}>
              {copy.auth.registerLink}
            </Link>
          </>
        ) : (
          <p>
            {copy.auth.hasAccount}{" "}
            <Link className="font-bold text-brand-navy-900 underline underline-offset-4" href={authHref("/login", destination)}>
              {copy.auth.loginLink}
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "email" | "password" | "text";
  autoComplete?: string;
}

function Field({
  autoComplete,
  error,
  id,
  label,
  onChange,
  type = "text",
  value,
}: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label className="text-sm font-bold text-text-primary" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={inputClass}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 text-sm font-semibold text-semantic-danger" id={id} role="alert">
      {message}
    </p>
  );
}
