export type Brand<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

export type VehicleId = Brand<string, "VehicleId">;
export type AuctionId = Brand<string, "AuctionId">;
export type LotId = Brand<string, "LotId">;
export type ServerTimestamp = Brand<string, "ServerTimestamp">;

export type CurrencyCode = "USD" | "UZS";

export type MoneyValue = {
  amountMinor: number;
  currency: CurrencyCode;
};

export type SortDirection = "ASC" | "DESC";

export type SortClause = {
  field: string;
  direction: SortDirection;
};

export type PageRequest = {
  page: number;
  size: number;
  sort?: SortClause[];
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: SortClause[];
};

export type ParsedEnum<TKnown extends string, TUnknown extends string> = {
  value: TKnown | TUnknown;
  raw: string;
  isKnown: boolean;
};

export type AuctionStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "LIVE"
  | "FINISHED"
  | "CANCELED"
  | "UNKNOWN_AUCTION_STATUS";

export type VehicleSummaryContract = {
  vehicleId: VehicleId;
  make?: string;
  model?: string;
  year?: number;
};

export type AuctionSummaryContract = {
  auctionId: AuctionId;
  vehicleId: VehicleId;
  status: ParsedEnum<AuctionStatus, "UNKNOWN_AUCTION_STATUS">;
  startPrice?: MoneyValue;
  currentPrice?: MoneyValue;
  startsAt?: ServerTimestamp;
  endsAt?: ServerTimestamp;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const parseInteger = (
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return clamp(Math.trunc(value), min, max);
};

const parseSortDirection = (value: unknown): SortDirection | undefined => {
  return value === "ASC" || value === "DESC" ? value : undefined;
};

export const parseSortClauses = (value: unknown): SortClause[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const candidate = item as Record<string, unknown>;
    const direction = parseSortDirection(candidate.direction);

    if (typeof candidate.field !== "string" || !candidate.field || !direction) {
      return [];
    }

    return [{ field: candidate.field, direction }];
  });
};

export const parsePageRequest = (input: Partial<PageRequest>): PageRequest => {
  return {
    page: parseInteger(input.page, 0, 0, Number.MAX_SAFE_INTEGER),
    size: parseInteger(input.size, 20, 1, 100),
    sort: parseSortClauses(input.sort),
  };
};

export const parsePageResponse = <T>(input: unknown): PageResponse<T> => {
  if (typeof input !== "object" || input === null) {
    return {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      sort: [],
    };
  }

  const value = input as Record<string, unknown>;

  return {
    content: Array.isArray(value.content) ? (value.content as T[]) : [],
    page: parseInteger(value.page, 0, 0, Number.MAX_SAFE_INTEGER),
    size: parseInteger(value.size, 20, 1, 100),
    totalElements: parseInteger(
      value.totalElements,
      0,
      0,
      Number.MAX_SAFE_INTEGER,
    ),
    totalPages: parseInteger(value.totalPages, 0, 0, Number.MAX_SAFE_INTEGER),
    sort: parseSortClauses(value.sort),
  };
};

export const parseEnumValue = <
  TKnown extends string,
  TUnknown extends string = string,
>(
  rawValue: unknown,
  knownValues: readonly TKnown[],
  unknownValue: TUnknown,
): ParsedEnum<TKnown, TUnknown> => {
  const raw = typeof rawValue === "string" ? rawValue : String(rawValue ?? "");

  if ((knownValues as readonly string[]).includes(raw)) {
    return { value: raw as TKnown, raw, isKnown: true };
  }

  return { value: unknownValue, raw, isKnown: false };
};
