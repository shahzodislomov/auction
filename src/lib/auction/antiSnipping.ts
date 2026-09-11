import { parseUzbekistanTimestamp } from "@/lib/formatting/date";

/**
 * Anti-snipping threshold: 2 minutes in milliseconds (120,000 ms).
 * If a new bid is placed when remaining time <= 2 minutes, the auction is extended.
 */
export const ANTI_SNIPPING_THRESHOLD_MS = 2 * 60 * 1000;

/**
 * Anti-snipping extension: 5 minutes in milliseconds (300,000 ms).
 */
export const ANTI_SNIPPING_EXTENSION_MS = 5 * 60 * 1000;

/**
 * Evaluates whether an anti-snipping extension should be applied upon a new bid,
 * and returns the extended end time.
 *
 * @param currentEndTime The current auction end time (ISO string or timestamp)
 * @param bidTimestamp The timestamp when the bid occurred (defaults to now)
 */
export function calculateAntiSnippingExtension(
  currentEndTime: string | null | undefined,
  bidTimestamp: number = Date.now(),
): {
  shouldExtend: boolean;
  newEndTime: string | null;
  newEndTimeMs: number | null;
  addedMs: number;
} {
  if (!currentEndTime) {
    return { shouldExtend: false, newEndTime: null, newEndTimeMs: null, addedMs: 0 };
  }

  const endMs = parseUzbekistanTimestamp(currentEndTime);
  if (!Number.isFinite(endMs)) {
    return { shouldExtend: false, newEndTime: null, newEndTimeMs: null, addedMs: 0 };
  }

  const remainingMs = endMs - bidTimestamp;

  // If bid is placed in the final 2 minutes before the end (0 < remaining <= 2 minutes)
  if (remainingMs > 0 && remainingMs <= ANTI_SNIPPING_THRESHOLD_MS) {
    const newEndTimeMs = endMs + ANTI_SNIPPING_EXTENSION_MS;
    return {
      shouldExtend: true,
      newEndTime: new Date(newEndTimeMs).toISOString(),
      newEndTimeMs,
      addedMs: ANTI_SNIPPING_EXTENSION_MS,
    };
  }

  return {
    shouldExtend: false,
    newEndTime: currentEndTime,
    newEndTimeMs: endMs,
    addedMs: 0,
  };
}

/**
 * Extends seconds counter if within 2 minutes (120 seconds).
 */
export function calculateAntiSnippingSeconds(
  remainingSeconds: number | null | undefined,
): {
  shouldExtend: boolean;
  newSeconds: number | null;
} {
  if (typeof remainingSeconds !== "number" || Number.isNaN(remainingSeconds)) {
    return { shouldExtend: false, newSeconds: null };
  }

  if (remainingSeconds > 0 && remainingSeconds <= 120) {
    return {
      shouldExtend: true,
      newSeconds: remainingSeconds + 300, // +5 minutes
    };
  }

  return {
    shouldExtend: false,
    newSeconds: remainingSeconds,
  };
}
