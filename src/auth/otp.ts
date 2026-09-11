export type OtpChannel = "email" | "sms";
export type OtpStatus =
  | "idle"
  | "sending"
  | "sent"
  | "verifying"
  | "verified"
  | "expired"
  | "rate_limited"
  | "error";

export type OtpChallenge = {
  channel: OtpChannel;
  resendAfterSeconds: number;
  expiresInSeconds: number;
  status: OtpStatus;
  canResend: boolean;
  canVerify: boolean;
  retryCount: number;
  errorMessage?: string;
};

const clampSeconds = (value: number): number => Math.max(0, Math.trunc(value));

export const createOtpChallenge = (
  channel: OtpChannel,
  resendAfterSeconds = 60,
  expiresInSeconds = 300,
): OtpChallenge => ({
  channel,
  resendAfterSeconds: clampSeconds(resendAfterSeconds),
  expiresInSeconds: clampSeconds(expiresInSeconds),
  status: "idle",
  canResend: resendAfterSeconds <= 0,
  canVerify: expiresInSeconds > 0,
  retryCount: 0,
});

export const tickOtpChallenge = (
  challenge: OtpChallenge,
  elapsedSeconds = 1,
): OtpChallenge => {
  const resendAfterSeconds = clampSeconds(
    challenge.resendAfterSeconds - elapsedSeconds,
  );
  const expiresInSeconds = clampSeconds(
    challenge.expiresInSeconds - elapsedSeconds,
  );
  const expired = expiresInSeconds === 0;

  return {
    ...challenge,
    resendAfterSeconds,
    expiresInSeconds,
    status: expired ? "expired" : challenge.status,
    canResend: !expired && resendAfterSeconds === 0,
    canVerify: !expired,
  };
};

export const expireOtpChallenge = (challenge: OtpChallenge): OtpChallenge => ({
  ...challenge,
  expiresInSeconds: 0,
  status: "expired",
  canResend: false,
  canVerify: false,
});

export const markOtpRateLimited = (
  challenge: OtpChallenge,
  retryAfterSeconds: number,
): OtpChallenge => ({
  ...challenge,
  resendAfterSeconds: clampSeconds(retryAfterSeconds),
  status: "rate_limited",
  canResend: false,
  canVerify: challenge.expiresInSeconds > 0,
  errorMessage: "auth.otp.rateLimited",
});

export const markOtpRetry = (
  challenge: OtpChallenge,
  errorMessage = "auth.otp.invalidCode",
): OtpChallenge => ({
  ...challenge,
  status: "error",
  retryCount: challenge.retryCount + 1,
  errorMessage,
});
