import { describe, expect, it } from "vitest";

import { adaptLiveAuctionRecord } from "@/components/auction/AuctionDiscovery";

describe("public auction vehicle images", () => {
  it("keeps vehicleId so cards can load /vehicles/{vehicleId}/images", () => {
    const auction = adaptLiveAuctionRecord({
      auctionId: 7,
      vehicleId: 6,
      status: "SCHEDULED",
      vehicle: {
        vehicleId: 6,
        makeName: "Hyundai",
        modelName: "Elantra",
        year: 2022,
      },
    });

    expect(auction).toMatchObject({ id: "7", vehicleId: "6" });
  });
});
