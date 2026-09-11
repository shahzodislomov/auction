import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";

/**
 * SECURITY NOTE: this reveals another user's name/phone. Make sure the
 * backend only allows a caller to fetch a counterpart's details when the
 * caller is the seller or the winning bidder of an auction that has
 * actually ended with that counterpart — not for arbitrary ids.
 */
export function useUserById(userId: string | null) {
  return useQuery({
    queryKey: ["userById", userId],
    queryFn: async () => {
      const response = await api.get("/user/getUserById", {
        params: { id: userId },
      });
      return response.data?.data ?? response.data;
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}

export interface AuctionCounterparty {
  id: string;
  label: string;
  phone: string | null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function firstNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** Normalizes a `GET /users/{id}` response into the shape the modal needs. */
export function normalizeCounterparty(
  value: unknown,
  fallbackId: string,
): AuctionCounterparty {
  const record = asRecord(value) ?? {};
  const idValue = record.id ?? record.userId;
  const id =
    typeof idValue === "string"
      ? idValue
      : typeof idValue === "number"
        ? String(idValue)
        : fallbackId;

  const composedName = [record.firstName, record.lastName]
    .filter((part): part is string => typeof part === "string" && part.trim() !== "")
    .join(" ");

  const label =
    firstNonEmptyString(record.name, record.fullName, composedName) ?? `#${fallbackId}`;
  const phone = firstNonEmptyString(record.phone, record.phoneNumber, record.phoneNo);

  return { id, label, phone };
}
