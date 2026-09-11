import { describe, expect, it } from "vitest";

import {
  canRelistAuction,
  eligibleVehicleOptions,
  formatAuctionMoney,
  formatThousands,
  ownedVehicleOptions,
  parseFormattedNumber,
  selectVehicleAuction,
} from "@/components/cabinet/AuctionsSection";
import { apiErrorMessage } from "@/lib/api/errorMessage";

describe("auction amount formatting", () => {
  it("formats amounts with spaces and converts them back for the API", () => {
    expect(formatThousands("1000000")).toBe("1 000 000");
    expect(formatThousands("1 000 000")).toBe("1 000 000");
    expect(parseFormattedNumber("1 000 000")).toBe(1000000);
  });

  it("prefers the backend response message and keeps a fallback", () => {
    expect(apiErrorMessage({ response: { data: { message: "Reserve price is invalid" } } }, "Fallback")).toBe("Reserve price is invalid");
    expect(apiErrorMessage({}, "Fallback")).toBe("Fallback");
  });

  it("translates backend validation errors according to current language", () => {
    const errorObj = {
      response: { data: { message: "Auction start time must be at least 1 minute in the future" } },
    };
    expect(apiErrorMessage(errorObj, "Fallback", "uz")).toBe(
      "Auksion boshlanish vaqti kamida 1 daqiqa kelajakda bo‘lishi kerak."
    );
    expect(apiErrorMessage(errorObj, "Fallback", "ru")).toBe(
      "Время начала аукциона должно быть как минимум на 1 минуту в будущем."
    );
    expect(apiErrorMessage(errorObj, "Fallback", "en")).toBe(
      "Auction start time must be at least 1 minute in the future."
    );
  });

  it("falls back to UZS when backend currency is empty or invalid", () => {
    expect(() => formatAuctionMoney(2000, "")).not.toThrow();
    expect(formatAuctionMoney(2000, "")).toContain("2");
    expect(() => formatAuctionMoney(2000, "UNKNOWN")).not.toThrow();
  });
});

describe("auction vehicle selector ownership", () => {
  it("keeps only vehicles belonging to the authenticated /auth/me id", () => {
    const vehicles = [
      { vehicleId: 1, sellerId: 219 },
      { vehicleId: 2, ownerId: "219" },
      { vehicleId: 3, userId: 220 },
      { vehicleId: 4 },
    ];

    expect(ownedVehicleOptions(vehicles, 219).map((vehicle) => vehicle.vehicleId)).toEqual([
      1,
      2,
    ]);
    expect(ownedVehicleOptions(vehicles, null)).toEqual([]);
  });

  it("keeps vehicles only when no active or sold auction exists", () => {
    const vehicles = [
      { vehicleId: 1, sellerId: 219 },
      { vehicleId: 2, sellerId: 219 },
      { vehicleId: 3, sellerId: 219 },
      { vehicleId: 4, sellerId: 219 },
    ];
    const auctions = [
      { status: "CANCELED", vehicleId: 1 },
      { status: "LIVE", vehicleId: 2 },
      { buyerId: 77, status: "FINISHED", vehicleId: 4 },
    ];

    expect(eligibleVehicleOptions(vehicles, 219, auctions).map((vehicle) => vehicle.vehicleId)).toEqual([1, 3]);
  });

  it("allows canceled and unsold finished auctions to be relisted", () => {
    expect(canRelistAuction({ status: "CANCELED", vehicleId: 1 })).toBe(true);
    expect(canRelistAuction({ status: "FINISHED", vehicleId: 1 })).toBe(true);
    expect(canRelistAuction({ buyerId: 9, status: "FINISHED", vehicleId: 1 })).toBe(false);
    expect(canRelistAuction({ status: "LIVE", vehicleId: 1 })).toBe(false);
    expect(canRelistAuction({ status: "FINISHED", vehicle: { vehicleId: 1 }, vehicleId: 1 })).toBe(true);
  });

  it("prefers an active auction over an older canceled auction for the same vehicle", () => {
    const scheduled = { auctionId: 67, startTime: "2026-08-13T13:03:00Z", status: "SCHEDULED", vehicleId: 93 };
    const canceled = { auctionId: 66, startTime: "2026-08-11T17:22:00Z", status: "CANCELED", vehicleId: 93 };

    expect(selectVehicleAuction([scheduled, canceled], "93")).toBe(scheduled);
    expect(canRelistAuction(selectVehicleAuction([scheduled, canceled], "93"))).toBe(false);
  });

  it("keeps a winnerless finished vehicle eligible", () => {
    expect(eligibleVehicleOptions(
      [{ sellerId: 219, vehicleId: 1 }],
      219,
      [{ status: "FINISHED", vehicle: { vehicleId: 1 }, vehicleId: 1 }],
    ).map((vehicle) => vehicle.vehicleId)).toEqual([1]);
  });
});
