"use client";

import { ArrowLeft, MailCheck } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/Button";
import { useTask6Copy } from "@/locales/task6";

const OTP_LENGTH = 5;

export interface OtpStepProps {
  email: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onBack?: () => void;
  resendAfterSeconds?: number;
  resendSuccessCount?: number;
  isVerifying?: boolean;
  isResending?: boolean;
  error?: string | null;
  completedContent?: ReactNode;
}

export function OtpStep({
  email,
  error,
  completedContent,
  isResending = false,
  isVerifying = false,
  onBack,
  onResend,
  onVerify,
  resendAfterSeconds = 60,
  resendSuccessCount = 0,
}: OtpStepProps) {
  const copy = useTask6Copy();
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [remaining, setRemaining] = useState(resendAfterSeconds);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const previousResendSuccessCount = useRef(resendSuccessCount);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [remaining]);

  useEffect(() => {
    if (previousResendSuccessCount.current === resendSuccessCount) return;
    previousResendSuccessCount.current = resendSuccessCount;
    setRemaining(resendAfterSeconds);
  }, [resendAfterSeconds, resendSuccessCount]);

  const updateDigit = (index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setLocalError(null);
    if (value && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    const next = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? "");
    setDigits(next);
    setLocalError(null);
    inputs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = digits.join("");
    if (code.length !== OTP_LENGTH) {
      setLocalError(copy.auth.codeRequired);
      inputs.current[digits.findIndex((digit) => !digit) || 0]?.focus();
      return;
    }
    onVerify(code);
  };

  const [resendCount, setResendCount] = useState(0);

  const handleResend = () => {
    if (remaining > 0 || isResending || resendCount >= 3) return;
    setResendCount((prev) => prev + 1);
    onResend();
  };

  const visibleError = error ?? localError;
  const codeComplete = digits.every(Boolean);
  const intro = copy.auth.otpIntro.replace("{email}", email);
  const maxResendsReached = resendCount >= 3;
  const resendLabel =
    maxResendsReached
      ? (copy.auth.resendLimitReached || "Maximum resend attempts reached")
      : remaining > 0
        ? copy.auth.resendIn
            .replace("{seconds}", String(remaining))
            .replace("{suffix}", copy.auth.secondsShort)
        : copy.auth.resendCode;

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="flex size-12 items-center justify-center rounded-lg bg-semantic-info-surface text-semantic-info">
        <MailCheck aria-hidden="true" size={24} />
      </div>
      <h2 className="mt-5 text-xl font-bold text-text-primary">{copy.auth.otpTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{intro}</p>

      <div className="mt-6 grid grid-cols-5 gap-2" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            aria-label={copy.auth.otpDigit.replace("{number}", String(index + 1))}
            aria-invalid={Boolean(visibleError)}
            aria-describedby={visibleError ? "otp-error" : undefined}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            className="min-h-12 min-w-0 rounded-md border border-border-default bg-surface-primary text-center text-lg font-bold tabular-nums outline-none transition-colors focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25"
            inputMode="numeric"
            maxLength={1}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            pattern="[0-9]*"
            type="text"
            value={digit}
          />
        ))}
      </div>
      {visibleError ? (
        <p id="otp-error" className="mt-2 text-sm font-semibold text-semantic-danger" role="alert">
          {visibleError}
        </p>
      ) : null}

      {codeComplete ? completedContent : null}

      <Button className="mt-6" disabled={isVerifying || !codeComplete} fullWidth type="submit">
        {isVerifying ? copy.auth.working : copy.auth.verifyCode}
      </Button>
      <Button
        className="mt-3"
        disabled={remaining > 0 || isResending || maxResendsReached}
        fullWidth
        onClick={handleResend}
        variant="outline"
      >
        {resendLabel}
      </Button>
      {onBack ? (
        <button
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-bold text-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          {copy.auth.backToForm}
        </button>
      ) : null}
    </form>
  );
}
