import type { ChampagneLocale } from "@/locales/champagne";

const BOOLEAN_STATE_KEYS = [
  "liked",
  "isLiked",
  "saved",
  "isSaved",
  "inWatchlist",
] as const;

const LIST_KEYS = ["content", "contents", "dtoList", "items", "lots"] as const;
const WRAPPER_KEYS = ["data", "payload", "result"] as const;

export const watchlistFeedbackCopy: Record<
  ChampagneLocale,
  {
    failed: string;
    removed: string;
    saved: string;
    unknown: string;
  }
> = {
  uz: {
    failed: "Kuzatuv holatini yangilab bo‘lmadi.",
    removed: "Kuzatuv ro‘yxatidan olib tashlandi.",
    saved: "Kuzatuv ro‘yxatiga saqlandi.",
    unknown: "Server kuzatuv holatini tasdiqlamadi.",
  },
  ru: {
    failed: "Не удалось обновить избранное.",
    removed: "Удалено из избранного.",
    saved: "Добавлено в избранное.",
    unknown: "Сервер не подтвердил состояние избранного.",
  },
  en: {
    failed: "The watchlist could not be updated.",
    removed: "Removed from your watchlist.",
    saved: "Saved to your watchlist.",
    unknown: "The server did not confirm the watchlist state.",
  },
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function booleanState(value: unknown): boolean | null {
  const record = asRecord(value);
  if (!record) return null;

  for (const key of BOOLEAN_STATE_KEYS) {
    if (typeof record[key] === "boolean") return record[key];
  }
  return null;
}

function responseRecords(value: unknown): Record<string, unknown>[] {
  const root = asRecord(value);
  if (!root) return [];

  return [
    root,
    ...WRAPPER_KEYS.flatMap((key) => {
      const nested = asRecord(root[key]);
      return nested ? [nested] : [];
    }),
  ];
}

function listFromPayload(value: unknown, depth = 0): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (depth > 2) return null;

  const record = asRecord(value);
  if (!record) return null;
  for (const key of LIST_KEYS) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  for (const key of WRAPPER_KEYS) {
    const nested = listFromPayload(record[key], depth + 1);
    if (nested) return nested;
  }
  return null;
}

function lotIdentifier(value: unknown): string | null {
  const record = asRecord(value);
  if (!record) return null;
  const nestedLot = asRecord(record.lot);
  const identifier = record.id ?? record.lotId ?? nestedLot?.id;

  if (typeof identifier === "string" && identifier.trim()) {
    return identifier;
  }
  if (typeof identifier === "number" && Number.isFinite(identifier)) {
    return String(identifier);
  }
  return null;
}

export function watchlistStateFromLikedLots(
  value: unknown,
  lotId: string,
): boolean | null {
  const lots = listFromPayload(value);
  if (!lots) return null;
  return lots.some((lot) => lotIdentifier(lot) === lotId);
}

export function watchlistStateFromLot(value: unknown): boolean | null {
  return booleanState(value);
}

export function watchlistStateFromToggleResponse(value: unknown): boolean | null {
  const records = responseRecords(value);
  if (
    records.some(
      (record) =>
        typeof record.status === "string" && record.status !== "OK",
    )
  ) {
    return null;
  }

  for (const record of records) {
    const state = booleanState(record);
    if (state !== null) return state;
  }

  const messages = [
    typeof value === "string" ? value : null,
    ...records.map((record) =>
      typeof record.message === "string" ? record.message : null,
    ),
  ];
  for (const message of messages) {
    const normalized = message?.trim().toLocaleLowerCase("en-US");
    if (normalized === "unliked successfully") return false;
    if (normalized === "liked successfully") return true;
  }
  return null;
}
