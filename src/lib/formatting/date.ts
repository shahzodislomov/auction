export const UZBEKISTAN_TIMEZONE = "Asia/Tashkent";

/**
 * Parses an auction date string safely into a Date object.
 *
 * Backend returns timestamps in ISO 8601 either with explicit timezone ('Z' / offset)
 * or as a bare local wall-time timestamp like '2026-09-07T19:19:00'.
 * If no timezone offset is present, it represents Uzbekistan time (UTC+5), so
 * '+05:00' is appended to ensure consistent epoch resolution across any client
 * or server environment (UTC Docker, local browser, node, etc.).
 */
export function parseUzbekistanDate(value: string | null | undefined): Date {
  if (!value || typeof value !== "string") return new Date(NaN);
  const trimmed = value.trim();
  if (!trimmed) return new Date(NaN);

  if (trimmed.includes("Z") || trimmed.includes("z") || /[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }

  return new Date(`${trimmed}+05:00`);
}

/**
 * Returns epoch timestamp in milliseconds for an auction date string,
 * or NaN if invalid.
 */
export function parseUzbekistanTimestamp(value: string | null | undefined): number {
  return parseUzbekistanDate(value).getTime();
}
