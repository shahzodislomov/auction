import { describe, expect, it } from "vitest";

import { formatAuctionPrice, formatMileage } from "./auction";

describe("auction formatting hydration contract", () => {
  it("formats prices with deterministic brand ordering and separators", () => {
    expect(
      formatAuctionPrice(1_185_000_000, {
        currency: "UZS",
        locale: "uz-Latn-UZ",
      }),
    ).toBe("UZS 1,185,000,000");

    expect(
      formatAuctionPrice(42_500.5, {
        currency: "USD",
        locale: "ru-RU",
      }),
    ).toBe("USD 42,500.50");
  });

  it("formats mileage without runtime-dependent ICU spacing", () => {
    expect(formatMileage(18_420, "uz-Latn-UZ")).toBe("18 420 km");
    expect(formatMileage(null, "en-US", "Unknown")).toBe("Unknown");
  });
});
