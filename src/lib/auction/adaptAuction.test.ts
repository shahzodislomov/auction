import { describe, expect, it } from "vitest";

import { adaptAuction } from "./adaptAuction";

describe("adaptAuction", () => {
  it("uses imageUrls from the nested vehicle without a separate vehicle request", () => {
    const auction = adaptAuction({
      auctionId: 65,
      status: "SCHEDULED",
      vehicle: {
        imageUrls: ["/front.jpg", "/rear.jpg"],
        makeName: "Toyota",
        modelName: "Land Cruiser",
        vehicleId: 92,
        year: 2024,
      },
      vehicleId: 92,
    });

    expect(auction?.images.map((image) => image.url)).toEqual(["/front.jpg", "/rear.jpg"]);
  });
});
