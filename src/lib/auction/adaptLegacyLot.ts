import type {
  AuctionCapability,
  AuctionCounts,
  AuctionCurrency,
  AuctionDocument,
  AuctionImage,
  AuctionIncrementType,
  AuctionRegion,
  AuctionSeller,
  AuctionStatus,
  InspectionStatus,
  LegacyLot,
  LocalizedText,
  VehicleAuction,
  VehicleInspection,
} from "@/lib/auction/types";
import { findCanonicalRegion } from "@/lib/regions";

const VEHICLE_CATEGORY_TOKENS = new Set([
  "CAR",
  "AUTO",
  "AUTOMOBILE",
  "AVTOMOBIL",
  "АВТОМОБИЛЬ",
]);

const AUCTION_CAPABILITIES = new Set<AuctionCapability>([
  "watchlist",
  "likes",
  "bidding",
  "deposits",
  "comments",
  "live-updates",
  "auto-bid",
  "vehicle-documents",
  "kyc",
  "payments",
  "contracts",
  "disputes",
  "dealer",
  "moderation",
  "risk",
  "audit",
]);

const LEGACY_ENDPOINT_CAPABILITIES: readonly AuctionCapability[] = [
  "watchlist",
];

const EMPTY_LOCALIZED_TEXT: LocalizedText = {
  default: null,
  uz: null,
  ru: null,
  en: null,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function parseJsonRecord(value: unknown): Record<string, unknown> | null {
  const directRecord = asRecord(value);
  if (directRecord) return directRecord;
  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  if (!trimmedValue.startsWith("{")) return null;

  try {
    return asRecord(JSON.parse(trimmedValue));
  } catch {
    return null;
  }
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function asIdentifier(value: unknown): string | null {
  const stringValue = asString(value);
  if (stringValue !== null) return stringValue;

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "bigint") return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;
  const compactValue = value.trim().replace(/[\s_]/g, "");
  const normalizedValue = /^-?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(
    compactValue,
  )
    ? compactValue.replaceAll(",", "")
    : compactValue;
  if (!/^-?\d+(?:\.\d+)?$/.test(normalizedValue)) return null;

  const numericValue = Number(normalizedValue);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function asNonNegativeNumber(value: unknown): number | null {
  const numericValue = asNumber(value);
  return numericValue !== null && numericValue >= 0 ? numericValue : null;
}

function asYear(value: unknown): number | null {
  const numericValue = asNumber(value);
  if (
    numericValue === null ||
    !Number.isInteger(numericValue) ||
    numericValue < 1886 ||
    numericValue > 2100
  ) {
    return null;
  }

  return numericValue;
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "true") return true;
  if (value === 0 || value === "false") return false;
  return null;
}

function asDateString(value: unknown): string | null {
  const stringValue = asString(value);
  if (stringValue === null || Number.isNaN(Date.parse(stringValue))) return null;
  return stringValue;
}

function normalizeKey(value: string): string {
  return value.toLocaleLowerCase("en-US").replace(/[\s_-]+/g, "");
}

function readFirst(
  source: Record<string, unknown> | null,
  keys: readonly string[],
): unknown {
  if (!source) return undefined;

  for (const key of keys) {
    if (Object.hasOwn(source, key)) return source[key];
  }

  const normalizedKeys = new Set(keys.map(normalizeKey));
  for (const [key, value] of Object.entries(source)) {
    if (normalizedKeys.has(normalizeKey(key))) return value;
  }

  return undefined;
}

function readFromLotOrAttributes(
  lot: Record<string, unknown>,
  attributes: Record<string, unknown> | null,
  keys: readonly string[],
): unknown {
  return readFirst(lot, keys) ?? readFirst(attributes, keys);
}

function toLocalizedText(value: unknown): LocalizedText {
  const stringValue = asString(value);
  if (stringValue !== null) {
    return { ...EMPTY_LOCALIZED_TEXT, default: stringValue };
  }

  const record = parseJsonRecord(value);
  if (!record) return { ...EMPTY_LOCALIZED_TEXT };

  return {
    default: asString(readFirst(record, ["default", "name", "title"])),
    uz: asString(readFirst(record, ["uz", "nameUz", "titleUz"])),
    ru: asString(readFirst(record, ["ru", "nameRu", "titleRu"])),
    en: asString(readFirst(record, ["en", "nameEn", "titleEn"])),
  };
}

function hasLocalizedText(value: LocalizedText): boolean {
  return Object.values(value).some((entry) => entry !== null);
}

function categoryTokens(value: unknown): string[] {
  const parsedRecord = parseJsonRecord(value);
  if (parsedRecord) {
    return Object.values(parsedRecord).flatMap((entry) => {
      const stringEntry = asString(entry);
      if (stringEntry === null) return [];

      return [
        stringEntry
          .normalize("NFKC")
          .trim()
          .replace(/\s+/g, " ")
          .toUpperCase(),
      ];
    });
  }

  const stringValue = asString(value);
  if (stringValue === null) return [];

  return [
    stringValue.normalize("NFKC").trim().replace(/\s+/g, " ").toUpperCase(),
  ];
}

function isConfirmedVehicle(lot: Record<string, unknown>): boolean {
  const lotType = lot.lotType;
  const lotTypeRecord = asRecord(lotType);
  const categoryName = lotTypeRecord ? lotTypeRecord.name : lotType;

  return categoryTokens(categoryName).some((token) =>
    VEHICLE_CATEGORY_TOKENS.has(token),
  );
}

function normalizeStatus(value: unknown): AuctionStatus {
  const status = asString(value)?.toUpperCase().replace(/[\s_]+/g, "-");

  switch (status) {
    case "PENDING":
    case "UPCOMING":
    case "SCHEDULED":
    case "NOT-STARTED":
      return "upcoming";
    case "ACTIVE":
    case "LIVE":
    case "IN-PROGRESS":
      return "live";
    case "ENDING-SOON":
      return "ending-soon";
    case "SOLD":
      return "sold";
    case "COMPLETED":
    case "FINISHED":
    case "ENDED":
      return "ended";
    case "CANCELED":
    case "CANCELLED":
    case "DELETED":
    case "DECLINED":
      return "cancelled";
    default:
      return "unknown";
  }
}

function normalizeCurrency(value: unknown): AuctionCurrency {
  const currency = asString(value)?.toUpperCase();
  return currency === "UZS" || currency === "USD" ? currency : "unknown";
}

function normalizeIncrementType(value: unknown): AuctionIncrementType {
  const incrementType = asString(value)?.toUpperCase();
  return incrementType === "FIXED" || incrementType === "PERCENTAGE"
    ? incrementType
    : "unknown";
}

function normalizeInspectionStatus(value: unknown): InspectionStatus {
  const status = asString(value)?.toUpperCase().replace(/[\s_]+/g, "-");

  switch (status) {
    case "PASSED":
    case "PASS":
    case "APPROVED":
      return "passed";
    case "ATTENTION":
    case "ADVISORY":
    case "ISSUES-FOUND":
      return "attention";
    case "FAILED":
    case "FAIL":
    case "REJECTED":
      return "failed";
    case "PENDING":
    case "IN-REVIEW":
      return "pending";
    default:
      return "unknown";
  }
}

function normalizeRegion(lot: Record<string, unknown>): AuctionRegion | null {
  const rawRegion = readFirst(lot, ["region", "regionName", "location"]);
  const regionRecord = asRecord(lot.region);
  const district = toLocalizedText(
    lot.district ?? readFirst(regionRecord, ["district"]),
  );

  const regionString =
    typeof rawRegion === "string"
      ? rawRegion
      : (asRecord(rawRegion)?.name ?? asRecord(rawRegion)?.nameUz ?? null);

  const canonical = findCanonicalRegion(regionString);
  let regionName: LocalizedText | null = null;
  if (canonical) {
    regionName = {
      default: canonical.uz,
      uz: canonical.uz,
      ru: canonical.ru,
      en: canonical.en,
    };
  } else if (
    regionString &&
    !["string", "null", "undefined", "none", "-"].includes(
      String(regionString).trim().toLowerCase(),
    )
  ) {
    regionName = toLocalizedText(rawRegion);
  }

  if (!regionName && !hasLocalizedText(district)) return null;
  return {
    name: regionName ?? { ...EMPTY_LOCALIZED_TEXT },
    district: hasLocalizedText(district) ? district : null,
  };
}

function normalizeSeller(lot: Record<string, unknown>): AuctionSeller | null {
  const seller = asRecord(lot.seller);
  const id =
    asIdentifier(readFirst(seller, ["id", "sellerId"])) ??
    asIdentifier(lot.sellerId);
  const explicitName = asString(
    readFirst(seller, ["name", "displayName", "secretName"]),
  );
  const firstName = asString(readFirst(seller, ["firstname", "firstName"]));
  const lastName = asString(readFirst(seller, ["lastname", "lastName"]));
  const combinedName = [firstName, lastName].filter(Boolean).join(" ") || null;
  const verified = asBoolean(readFirst(seller, ["verified", "isVerified"]));
  const rating = asNonNegativeNumber(readFirst(seller, ["rating"]));

  if (
    id === null &&
    explicitName === null &&
    combinedName === null &&
    verified === null &&
    rating === null
  ) {
    return null;
  }

  return {
    id,
    name: explicitName ?? combinedName,
    verified,
    rating,
  };
}

function normalizeInspection(
  lot: Record<string, unknown>,
): VehicleInspection | null {
  const inspection = asRecord(lot.inspection);
  if (!inspection) return null;

  return {
    status: normalizeInspectionStatus(inspection.status),
    score: asNonNegativeNumber(inspection.score),
    inspectedAt: asDateString(
      readFirst(inspection, ["inspectedAt", "inspectionDate", "date"]),
    ),
    summary: toLocalizedText(
      readFirst(inspection, ["summary", "description", "notes"]),
    ),
  };
}

function normalizeDocuments(lot: Record<string, unknown>): AuctionDocument[] {
  if (!Array.isArray(lot.documents)) return [];

  return lot.documents.flatMap((document) => {
    const record = asRecord(document);
    if (!record) return [];

    return [
      {
        id: asIdentifier(record.id),
        type: asString(readFirst(record, ["type", "documentType"])) ?? "unknown",
        name: asString(readFirst(record, ["name", "title", "fileName"])),
        url: asString(readFirst(record, ["url", "documentUrl", "fileUrl"])),
        verified: asBoolean(
          readFirst(record, ["verified", "isVerified", "approved"]),
        ),
      },
    ];
  });
}

function normalizeImages(lot: Record<string, unknown>): AuctionImage[] {
  const images = Array.isArray(lot.lotImageDtoList)
    ? lot.lotImageDtoList
    : Array.isArray(lot.images)
      ? lot.images
      : [];

  return images.flatMap((image) => {
    const directUrl = asString(image);
    if (directUrl !== null) {
      return [{ id: null, url: directUrl, alt: { ...EMPTY_LOCALIZED_TEXT } }];
    }

    const record = asRecord(image);
    const url = asString(readFirst(record, ["imageUrl", "url", "src"]));
    if (url === null) return [];

    return [
      {
        id: asIdentifier(record?.id),
        url,
        alt: toLocalizedText(readFirst(record, ["altText", "alt", "title"])),
      },
    ];
  });
}

function normalizeCounts(lot: Record<string, unknown>): AuctionCounts {
  const counts = asRecord(lot.counts) ?? asRecord(lot.lotCounts);

  return {
    views: asNonNegativeNumber(
      readFirst(counts, ["views", "viewCount"]) ??
        readFirst(lot, ["views", "viewCount"]),
    ),
    bids: asNonNegativeNumber(
      readFirst(counts, ["bids", "bidCount"]) ??
        readFirst(lot, ["bids", "bidCount"]),
    ),
    watchers: asNonNegativeNumber(
      readFirst(counts, ["watchers", "watcherCount", "likeCount"]) ??
        readFirst(lot, ["watchers", "watcherCount", "likeCount"]),
    ),
    participants: asNonNegativeNumber(
      readFirst(counts, ["participants", "participantCount", "depositCount"]) ??
        readFirst(lot, ["participants", "participantCount", "depositCount"]),
    ),
  };
}

function normalizeCapabilities(lot: Record<string, unknown>): AuctionCapability[] {
  const capabilities = new Set<AuctionCapability>(LEGACY_ENDPOINT_CAPABILITIES);
  if (!Array.isArray(lot.capabilities)) return [...capabilities];

  lot.capabilities.forEach((capability) => {
    const stringValue = asString(capability);
    if (
      stringValue === null ||
      !AUCTION_CAPABILITIES.has(stringValue as AuctionCapability)
    ) {
      return;
    }

    capabilities.add(stringValue as AuctionCapability);
  });

  return [...capabilities];
}

export function adaptLegacyLot(lot: LegacyLot): VehicleAuction | null {
  const source = asRecord(lot);
  if (!source || !isConfirmedVehicle(source)) return null;

  const id = asIdentifier(source.id);
  if (id === null) return null;

  const attributes = parseJsonRecord(source.attributes);
  const damage = toLocalizedText(
    readFromLotOrAttributes(source, attributes, [
      "damage",
      "damageDescription",
      "damageDisclosure",
      "knownDamage",
      "knownDamageAndRepairs",
    ]),
  );

  return {
    id,
    vehicleId:
      asIdentifier(source.vehicleId) ??
      asIdentifier(readFirst(asRecord(source.vehicle), ["vehicleId", "id"])),
    lotNumber: asIdentifier(readFirst(source, ["lotNumber", "referenceNumber"])),
    vin: asString(readFromLotOrAttributes(source, attributes, ["vin"])),
    status: normalizeStatus(readFirst(source, ["lotStatus", "status"])),
    title: toLocalizedText(source.title),
    description: toLocalizedText(source.description),
    make: asString(
      readFromLotOrAttributes(source, attributes, [
        "make",
        "brand",
        "manufacturer",
        "marka",
      ]),
    ),
    model: asString(
      readFromLotOrAttributes(source, attributes, ["model"]),
    ),
    year: asYear(
      readFromLotOrAttributes(source, attributes, ["year", "modelYear"]),
    ),
    startPrice: asNonNegativeNumber(source.startPrice),
    depositPercent: asNonNegativeNumber(source.depositPercent),
    currentPrice: asNonNegativeNumber(source.currentPrice),
    finalPrice: asNonNegativeNumber(
      readFirst(source, ["finalPrice", "winningPrice", "soldPrice"]),
    ),
    currency: normalizeCurrency(source.currency),
    incrementType: normalizeIncrementType(source.incrementType),
    incrementValue: asNonNegativeNumber(source.incrementValue),
    startTime: asDateString(readFirst(source, ["startTime", "startsAt"])),
    endTime: asDateString(readFirst(source, ["endTime", "endsAt"])),
    publishedAt: asDateString(
      readFirst(source, ["publishedAt", "createdAt", "createdDate"]),
    ),
    mileage: asNonNegativeNumber(
      readFromLotOrAttributes(source, attributes, [
        "mileage",
        "odometer",
        "kilometrage",
        "probeg",
      ]),
    ),
    fuel:
      asString(
        readFromLotOrAttributes(source, attributes, ["fuel", "fuelType"]),
      ) ?? "unknown",
    transmission:
      asString(
        readFromLotOrAttributes(source, attributes, [
          "transmission",
          "gearbox",
        ]),
      ) ?? "unknown",
    drivetrain:
      asString(
        readFromLotOrAttributes(source, attributes, [
          "drivetrain",
          "driveType",
          "wheelDrive",
        ]),
      ) ?? "unknown",
    bodyType: asString(
      readFromLotOrAttributes(source, attributes, [
        "bodyType",
        "body_type",
        "kuzov",
        "body",
      ]),
    ),
    engineVolume: asString(
      readFromLotOrAttributes(source, attributes, [
        "engineVolume",
        "engine_volume",
        "engine",
        "volume",
      ]),
    ),
    color: asString(
      readFromLotOrAttributes(source, attributes, [
        "color",
        "colour",
        "rangi",
        "tsvet",
      ]),
    ),
    region: normalizeRegion(source),
    condition:
      asString(
        readFromLotOrAttributes(source, attributes, [
          "condition",
          "conditionDescription",
          "technicalCondition",
          "vehicleCondition",
        ]),
      ) ?? "unknown",
    damage: hasLocalizedText(damage) ? damage : null,
    seller: normalizeSeller(source),
    inspection: normalizeInspection(source),
    documents: normalizeDocuments(source),
    images: normalizeImages(source),
    counts: normalizeCounts(source),
    capabilities: normalizeCapabilities(source),
  };
}
