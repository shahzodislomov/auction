import { describe, expect, it } from "vitest";

import { adaptLegacyLot } from "@/lib/auction/adaptLegacyLot";
import { selectVehicleAuctions } from "@/lib/auction/selectVehicleAuctions";

describe("adaptLegacyLot", () => {
  it("rejects a confirmed non-car lot", () => {
    expect(
      adaptLegacyLot({ id: 7, lotType: { name: "ELECTRONICS" } }),
    ).toBeNull();
  });

  it("recognizes a localized car category and normalizes the id", () => {
    expect(
      adaptLegacyLot({
        id: 8,
        lotType: { name: { en: "CAR", uz: "AVTOMOBIL" } },
        title: "Tahoe",
      })?.id,
    ).toBe("8");
  });

  it("keeps the vehicle id needed to load auction card images", () => {
    expect(
      adaptLegacyLot({
        id: 8,
        lotType: { name: "CAR" },
        vehicleId: 42,
      })?.vehicleId,
    ).toBe("42");
  });

  it("enables the established watchlist endpoint for legacy vehicle lots", () => {
    expect(
      adaptLegacyLot({
        id: 8,
        lotType: { name: "CAR" },
        title: "Tahoe",
      })?.capabilities,
    ).toContain("watchlist");
  });

  it("does not infer a vehicle category from the title", () => {
    expect(adaptLegacyLot({ id: 9, title: "Chevrolet Tahoe" })).toBeNull();
  });

  it("does not treat a nested metadata token as the lot category", () => {
    expect(
      adaptLegacyLot({
        id: 10,
        lotType: {
          name: { en: "ELECTRONICS", metadata: { suggestedCategory: "CAR" } },
        },
      }),
    ).toBeNull();
  });

  it("does not reinterpret an ambiguous decimal price", () => {
    expect(
      adaptLegacyLot({
        id: 11,
        lotType: { name: "CAR" },
        startPrice: "1,5",
      })?.startPrice,
    ).toBeNull();
  });

  it("preserves supplied condition and localized damage disclosure fields", () => {
    const auction = adaptLegacyLot({
      id: 12,
      lotType: { name: "CAR" },
      attributes: JSON.stringify({
        vehicleCondition: "Used · good condition",
        damageDisclosure: {
          uz: "Orqa bamper ta'mirlangan.",
          ru: "Задний бампер отремонтирован.",
          en: "Rear bumper repaired.",
        },
      }),
    });

    expect(auction?.condition).toBe("Used · good condition");
    expect(auction?.damage).toEqual({
      default: null,
      uz: "Orqa bamper ta'mirlangan.",
      ru: "Задний бампер отремонтирован.",
      en: "Rear bumper repaired.",
    });
  });

  it("keeps missing damage disclosure unknown instead of inferring it", () => {
    expect(
      adaptLegacyLot({
        id: 13,
        lotType: { name: "CAR" },
        description: "Clean exterior.",
      })?.damage,
    ).toBeNull();
  });
});

describe("selectVehicleAuctions", () => {
  it("keeps only confirmed vehicle lots", () => {
    const auctions = selectVehicleAuctions([
      { id: 7, lotType: { name: "ELECTRONICS" } },
      { id: 8, lotType: { name: "CAR" }, title: "Tahoe" },
    ]);

    expect(auctions.map(({ id }) => id)).toEqual(["8"]);
  });

  it("never returns development fixtures in production", () => {
    expect(
      selectVehicleAuctions([], {
        allowDemo: true,
        nodeEnv: "production",
      }),
    ).toEqual([]);
  });

  it("does not return development fixtures outside production either", () => {
    expect(
      selectVehicleAuctions([], {
        allowDemo: true,
        nodeEnv: "development",
      }),
    ).toEqual([]);
  });
});
