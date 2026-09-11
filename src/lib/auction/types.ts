export type AuctionStatus =
  | "upcoming"
  | "live"
  | "ending-soon"
  | "sold"
  | "ended"
  | "cancelled"
  | "unknown";

export type AuctionCapability =
  | "watchlist"
  | "likes"
  | "bidding"
  | "deposits"
  | "comments"
  | "live-updates"
  | "auto-bid"
  | "vehicle-documents"
  | "kyc"
  | "payments"
  | "contracts"
  | "disputes"
  | "dealer"
  | "moderation"
  | "risk"
  | "audit";

export type AuctionCurrency = "UZS" | "USD" | "unknown";

export type AuctionIncrementType = "FIXED" | "PERCENTAGE" | "unknown";

export interface LocalizedText {
  default: string | null;
  uz: string | null;
  ru: string | null;
  en: string | null;
}

export interface AuctionRegion {
  name: LocalizedText;
  district: LocalizedText | null;
}

export interface AuctionSeller {
  id: string | null;
  name: string | null;
  verified: boolean | null;
  rating: number | null;
}

export type InspectionStatus =
  | "passed"
  | "attention"
  | "failed"
  | "pending"
  | "unknown";

export interface VehicleInspection {
  status: InspectionStatus;
  score: number | null;
  inspectedAt: string | null;
  summary: LocalizedText;
}

export interface AuctionDocument {
  id: string | null;
  type: string;
  name: string | null;
  url: string | null;
  verified: boolean | null;
}

export interface AuctionImage {
  id: string | null;
  url: string;
  alt: LocalizedText;
}

export interface AuctionCounts {
  views: number | null;
  bids: number | null;
  watchers: number | null;
  participants: number | null;
}

export interface VehicleAuction {
  id: string;
  vehicleId?: string | null;
  lotNumber: string | null;
  vin: string | null;
  status: AuctionStatus;
  title: LocalizedText;
  description: LocalizedText;
  make: string | null;
  model: string | null;
  year: number | null;
  startPrice: number | null;
  depositPercent?: number | null;
  currentPrice: number | null;
  finalPrice: number | null;
  currency: AuctionCurrency;
  incrementType: AuctionIncrementType;
  incrementValue: number | null;
  startTime: string | null;
  endTime: string | null;
  publishedAt: string | null;
  mileage: number | null;
  fuel: string;
  transmission: string;
  drivetrain: string;
  bodyType?: string | null;
  engineVolume?: number | string | null;
  color?: string | null;
  region: AuctionRegion | null;
  condition: string;
  damage: LocalizedText | null;
  seller: AuctionSeller | null;
  inspection: VehicleInspection | null;
  documents: readonly AuctionDocument[];
  images: readonly AuctionImage[];
  counts: AuctionCounts;
  capabilities: readonly AuctionCapability[];
}

export interface LegacyLot extends Record<string, unknown> {
  id?: unknown;
  vehicleId?: unknown;
  lotType?:
    | string
    | ({ name?: unknown } & Record<string, unknown>)
    | null;
  lotStatus?: unknown;
  sellerId?: unknown;
  title?: unknown;
  description?: unknown;
  startPrice?: unknown;
  currentPrice?: unknown;
  incrementType?: unknown;
  incrementValue?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  lotImageDtoList?: unknown;
  attributes?: unknown;
}
