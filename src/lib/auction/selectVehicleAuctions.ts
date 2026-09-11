import { adaptAuction } from "@/lib/auction/adaptAuction";
import type { VehicleAuction } from "@/lib/auction/types";

export interface VehicleAuctionSelectionOptions {
  allowDemo?: boolean;
  nodeEnv?: string;
}

export function selectVehicleAuctions(
  auctions: readonly unknown[] | null | undefined,
  options: VehicleAuctionSelectionOptions = {},
): VehicleAuction[] {
  if (!Array.isArray(auctions)) return [];

  const liveAuctions = auctions.flatMap((value) => {
    const auction = adaptAuction(value);
    return auction === null ? [] : [auction];
  });

  if (liveAuctions.length > 0 || auctions.length > 0) return liveAuctions;
  void options;
  return [];
}
