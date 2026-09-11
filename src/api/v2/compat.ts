import type { AuctionId, LotId, VehicleId } from "./contracts";

export type LegacyLotIdentity = {
  lotId: LotId;
  vehicleId: VehicleId;
  auctionId: AuctionId;
  source: "legacy-lot";
};

export const createLegacyLotIdentity = (
  lotId: string | number,
): LegacyLotIdentity => {
  const normalized = String(lotId);

  return {
    lotId: normalized as LotId,
    vehicleId: normalized as VehicleId,
    auctionId: normalized as AuctionId,
    source: "legacy-lot",
  };
};
