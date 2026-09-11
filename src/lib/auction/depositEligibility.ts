import { parseUzbekistanTimestamp } from "@/lib/formatting/date";
import type { VehicleAuction } from "./types";

/**
 * Deposit cutoff threshold: 5 minutes in milliseconds (300,000 ms).
 * Once an auction has started, depositing and participating are only allowed
 * if there are MORE than 5 minutes remaining until the auction ends.
 */
export const DEPOSIT_CUTOFF_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Deposit cutoff threshold: 5 minutes in seconds (300 seconds).
 */
export const DEPOSIT_CUTOFF_THRESHOLD_SECONDS = 300;

export interface DepositCutoffCheckParams {
  status?: VehicleAuction["status"] | string | null;
  startTime?: string | null;
  endTime?: string | null;
  remainingSeconds?: number | null;
  now?: number;
}

export interface DepositCutoffCheckResult {
  isStarted: boolean;
  isCutoffReached: boolean;
  remainingMs: number | null;
}

/**
 * Checks if the auction has already started.
 */
export function isAuctionStarted(
  auction: {
    status?: VehicleAuction["status"] | string | null;
    startTime?: string | null;
  },
  now: number = Date.now(),
): boolean {
  if (auction.status === "upcoming") {
    return false;
  }
  if (auction.status === "live" || auction.status === "ending-soon") {
    return true;
  }
  if (!auction.startTime) return false;
  const startMs = parseUzbekistanTimestamp(auction.startTime);
  return Number.isFinite(startMs) && now >= startMs;
}

/**
 * Evaluates whether deposit placement is blocked due to the 5-minute cutoff rule.
 *
 * Business rule:
 * Users can pay a deposit and join an auction even after it starts,
 * BUT only if there are more than 5 minutes remaining before the auction ends.
 * If remaining time <= 5 minutes, deposit is locked.
 */
export function checkDepositCutoff({
  status,
  startTime,
  endTime,
  remainingSeconds,
  now = Date.now(),
}: DepositCutoffCheckParams): DepositCutoffCheckResult {
  const started = isAuctionStarted({ status, startTime }, now);
  if (!started) {
    return {
      isStarted: false,
      isCutoffReached: false,
      remainingMs: null,
    };
  }

  if (typeof remainingSeconds === "number" && !Number.isNaN(remainingSeconds)) {
    const isCutoffReached = remainingSeconds <= DEPOSIT_CUTOFF_THRESHOLD_SECONDS;
    return {
      isStarted: true,
      isCutoffReached,
      remainingMs: remainingSeconds * 1000,
    };
  }

  if (!endTime) {
    return {
      isStarted: true,
      isCutoffReached: false,
      remainingMs: null,
    };
  }

  const endMs = parseUzbekistanTimestamp(endTime);
  if (!Number.isFinite(endMs)) {
    return {
      isStarted: true,
      isCutoffReached: false,
      remainingMs: null,
    };
  }

  const remainingMs = endMs - now;
  // If auction has started, deposit is only allowed if remaining time > 5 minutes (300,000 ms).
  const isCutoffReached = remainingMs <= DEPOSIT_CUTOFF_THRESHOLD_MS;

  return {
    isStarted: true,
    isCutoffReached,
    remainingMs,
  };
}
