import type { AuctionCurrency } from "@/lib/auction/types";

export interface AuctionPriceFormatOptions {
  currency?: AuctionCurrency;
  locale?: string;
  fallback?: string;
}

function isFiniteNonNegative(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && Number.isFinite(value) && value >= 0;
}

function groupInteger(value: string, separator: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

function formatDeterministicNumber(
  value: number,
  fractionDigits: number,
  groupSeparator: string,
): string {
  const [integer, fraction] = value.toFixed(fractionDigits).split(".");
  const groupedInteger = groupInteger(integer, groupSeparator);
  return fraction === undefined ? groupedInteger : `${groupedInteger}.${fraction}`;
}

export function formatAuctionPrice(
  value: number | null | undefined,
  options: AuctionPriceFormatOptions | AuctionCurrency = {},
  localeOverride?: string,
): string {
  const normalizedOptions =
    typeof options === "string" ? { currency: options } : options;
  const fallback = normalizedOptions.fallback ?? "—";
  const currency = normalizedOptions.currency ?? "UZS";

  if (!isFiniteNonNegative(value) || currency === "unknown") return fallback;

  // Currency and grouping are deliberately deterministic across Node and the
  // browser. ICU data can otherwise change currency order and whitespace
  // during hydration for the same requested locale.
  void localeOverride;
  void normalizedOptions.locale;
  const fractionDigits = currency === "UZS" ? 0 : 2;
  return `${currency} ${formatDeterministicNumber(value, fractionDigits, ",")}`;
}

export function formatMileage(
  value: number | null | undefined,
  locale = "uz-UZ",
  fallback = "—",
): string {
  if (!isFiniteNonNegative(value)) return fallback;

  void locale;
  return `${formatDeterministicNumber(value, 0, " ")} km`;
}
