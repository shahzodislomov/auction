import { describe, expect, it } from "vitest";

import {
  canonicalizeBidAmount,
  getNextBid,
} from "@/lib/auction/bidding";

describe("getNextBid", () => {
  it("adds a fixed increment to the highest bid", () => {
    expect(
      getNextBid(
        {
          currency: "USD",
          startPrice: 100,
          incrementType: "FIXED",
          incrementValue: 20,
        },
        140,
      ),
    ).toBe(160);
  });

  it("keeps decimal percentage minimums returned by backend rules", () => {
    expect(
      getNextBid(
        {
          currency: "USD",
          incrementType: "PERCENTAGE",
          incrementValue: 20,
          startPrice: 288,
        },
        288,
      ),
    ).toBe(345.6);
  });

  it("rounds percentage bid tails to backend money precision", () => {
    expect(
      getNextBid(
        {
          currency: "UZS",
          incrementType: "PERCENTAGE",
          incrementValue: 50,
          startPrice: 1518.75,
        },
        1518.75,
      ),
    ).toBe(2278.13);
  });

  it("rounds floating point half-cent tails upward like the backend", () => {
    expect(
      getNextBid(
        {
          currency: "UZS",
          incrementType: "PERCENTAGE",
          incrementValue: 50,
          startPrice: 11533.05,
        },
        11533.05,
      ),
    ).toBe(17299.58);
  });

  it("returns a percentage minimum that already matches the documented currency step", () => {
    expect(
      getNextBid(
        {
          currency: "USD",
          incrementType: "PERCENTAGE",
          incrementValue: 3,
          startPrice: 100,
        },
        100,
      ),
    ).toBe(103);
  });

  it.each([0, -1])("rejects a nonpositive increment of %s", (incrementValue) => {
    expect(
      getNextBid({
        currency: "UZS",
        incrementType: "FIXED",
        incrementValue,
        startPrice: 100,
      }),
    ).toBeNull();
  });

  it("adds a percentage increment to the highest bid", () => {
    expect(
      getNextBid(
        {
          currency: "USD",
          startPrice: 100,
          incrementType: "PERCENTAGE",
          incrementValue: 10,
        },
        200,
      ),
    ).toBe(220);
  });

  it("uses the start price when there is no highest bid", () => {
    expect(
      getNextBid({
        currency: "USD",
        startPrice: 100,
        incrementType: "FIXED",
        incrementValue: 20,
      }),
    ).toBe(120);
  });

  it("rounds decimal UZS percentage increments to money precision", () => {
    expect(
      getNextBid({
        currency: "UZS",
        incrementType: "PERCENTAGE",
        incrementValue: 2.5,
        startPrice: 100_001,
      }),
    ).toBe(102_501.03);
  });

  it("allows small UZS fixed increments returned by the auction backend", () => {
    expect(
      getNextBid({
        currency: "UZS",
        incrementType: "FIXED",
        incrementValue: 20,
        startPrice: 200,
      }),
    ).toBe(220);
  });

  it("rounds decimal fixed results to money precision", () => {
    expect(
      getNextBid({
        currency: "USD",
        incrementType: "FIXED",
        incrementValue: 3.005,
        startPrice: 100,
      }),
    ).toBe(103.01);
  });

  it("does not require a supported currency to calculate backend bid amounts", () => {
    expect(
      getNextBid({
        incrementType: "FIXED",
        incrementValue: 20,
        startPrice: 100,
      }),
    ).toBe(120);
    expect(
      getNextBid({
        currency: "EUR" as "USD",
        incrementType: "FIXED",
        incrementValue: 20,
        startPrice: 100,
      }),
    ).toBe(120);
  });

  it("canonicalizes bid amounts without forcing integer currency steps", () => {
    expect(canonicalizeBidAmount(103, "USD")).toBe(103);
    expect(canonicalizeBidAmount(103.005, "USD")).toBe(103.01);
    expect(canonicalizeBidAmount(1_205_000_000, "UZS")).toBe(1_205_000_000);
    expect(canonicalizeBidAmount(1_205_000_001, "UZS")).toBe(1_205_000_001);
    expect(canonicalizeBidAmount(71663.61600000001, "UZS")).toBe(71663.62);
  });
});
