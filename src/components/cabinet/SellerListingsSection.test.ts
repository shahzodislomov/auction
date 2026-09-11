import { describe, expect, it } from "vitest";

import { preferredAuctionsByVehicle } from "./SellerListingsSection";

describe("preferredAuctionsByVehicle", () => {
  it("joins auctions to vehicles and prefers the active auction", () => {
    const result = preferredAuctionsByVehicle([
      { auctionId: 10, status: "FINISHED", vehicleId: 81 },
      { auctionId: 11, status: "LIVE", vehicleId: 81 },
      { auctionId: 12, status: "SCHEDULED", vehicle: { vehicleId: 82 } },
    ]);

    expect(result.get("81")?.auctionId).toBe(11);
    expect(result.get("82")?.auctionId).toBe(12);
  });
});
