import assert from "node:assert/strict";
import test from "node:test";

import {
  validateRegistrationInput,
  type RegistrationInput,
} from "../src/auth/validation";
import {
  createOtpChallenge,
  expireOtpChallenge,
  markOtpRateLimited,
  tickOtpChallenge,
} from "../src/auth/otp";
import { createTokenRefreshManager } from "../src/auth/refresh";
import { createSessionManager } from "../src/auth/sessions";

const validBaseRegistration: Omit<RegistrationInput, "mode" | "email" | "phone"> = {
  firstName: "Ali",
  lastName: "Valiyev",
  password: "strong-pass",
  confirmPassword: "strong-pass",
  acceptedTerms: true,
};

test("email registration validates email-specific fields only", () => {
  const result = validateRegistrationInput({
    ...validBaseRegistration,
    mode: "email",
    email: "ali@example.com",
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.payload, {
    mode: "email",
    email: "ali@example.com",
    firstName: "Ali",
    lastName: "Valiyev",
    password: "strong-pass",
  });
});

test("phone registration validates phone-specific fields only", () => {
  const result = validateRegistrationInput({
    ...validBaseRegistration,
    mode: "phone",
    phone: "901234567",
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.payload, {
    mode: "phone",
    phone: "+998901234567",
    firstName: "Ali",
    lastName: "Valiyev",
    password: "strong-pass",
  });
});

test("phone registration is invalid when phone is malformed", () => {
  const result = validateRegistrationInput({
    ...validBaseRegistration,
    mode: "phone",
    phone: "123",
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.phone, "auth.validation.phoneInvalid");
});

test("OTP challenge tracks resend countdown, expiry, retry, and rate-limit states", () => {
  const initial = createOtpChallenge("sms", 60, 300);

  assert.equal(initial.channel, "sms");
  assert.equal(initial.canResend, false);
  assert.equal(initial.status, "idle");

  const afterMinute = tickOtpChallenge(initial, 60);
  assert.equal(afterMinute.canResend, true);
  assert.equal(afterMinute.resendAfterSeconds, 0);
  assert.equal(afterMinute.expiresInSeconds, 240);

  const expired = expireOtpChallenge(afterMinute);
  assert.equal(expired.status, "expired");
  assert.equal(expired.canVerify, false);

  const rateLimited = markOtpRateLimited(afterMinute, 120);
  assert.equal(rateLimited.status, "rate_limited");
  assert.equal(rateLimited.canResend, false);
  assert.equal(rateLimited.resendAfterSeconds, 120);
});

test("token refresh is single-flight for concurrent 401 retries", async () => {
  let refreshCalls = 0;
  const manager = createTokenRefreshManager({
    getRefreshToken: () => "refresh-token",
    requestRefresh: async () => {
      refreshCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { accessToken: "new-access", refreshToken: "new-refresh" };
    },
    setTokens: () => undefined,
    clearAuthState: () => undefined,
  });

  const [first, second] = await Promise.all([
    manager.refreshAccessToken(),
    manager.refreshAccessToken(),
  ]);

  assert.equal(refreshCalls, 1);
  assert.equal(first.accessToken, "new-access");
  assert.equal(second.accessToken, "new-access");
});

test("token refresh clears auth state after refresh failure", async () => {
  let cleared = false;
  const manager = createTokenRefreshManager({
    getRefreshToken: () => "refresh-token",
    requestRefresh: async () => {
      throw new Error("refresh rejected");
    },
    setTokens: () => undefined,
    clearAuthState: () => {
      cleared = true;
    },
  });

  await assert.rejects(() => manager.refreshAccessToken(), /refresh rejected/);
  assert.equal(cleared, true);
});

test("token refresh preserves auth state when no refresh token exists", async () => {
  let cleared = false;
  const manager = createTokenRefreshManager({
    getRefreshToken: () => null,
    requestRefresh: async () => {
      throw new Error("should not request refresh without a refresh token");
    },
    setTokens: () => undefined,
    clearAuthState: () => {
      cleared = true;
    },
  });

  await assert.rejects(
    () => manager.refreshAccessToken(),
    /auth\.refresh\.missingRefreshToken/,
  );
  assert.equal(cleared, false);
});

test("session manager can revoke one session and other sessions", async () => {
  const revoked: string[] = [];
  let revokedOthers = false;
  const manager = createSessionManager({
    listSessions: async () => [
      { id: "current", current: true, deviceName: "Chrome", lastSeenAt: "2026-07-16T04:00:00Z" },
      { id: "other", current: false, deviceName: "Firefox", lastSeenAt: "2026-07-15T04:00:00Z" },
    ],
    revokeSession: async (sessionId) => {
      revoked.push(sessionId);
    },
    revokeOtherSessions: async () => {
      revokedOthers = true;
    },
  });

  const sessions = await manager.list();
  await manager.revoke("other");
  await manager.revokeOthers();

  assert.equal(sessions.length, 2);
  assert.deepEqual(revoked, ["other"]);
  assert.equal(revokedOthers, true);
});
