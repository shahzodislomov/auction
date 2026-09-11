import { describe, expect, it } from "vitest";
import {
  ANTI_SNIPPING_EXTENSION_MS,
  ANTI_SNIPPING_THRESHOLD_MS,
  calculateAntiSnippingExtension,
  calculateAntiSnippingSeconds,
} from "./antiSnipping";

describe("antiSnipping extension utility", () => {
  const baseEnd = "2026-09-07T15:00:00.000Z";
  const baseEndMs = new Date(baseEnd).getTime();

  it("extends auction by 5 minutes if bid is placed 1 minute before end", () => {
    const bidTime = baseEndMs - 60 * 1000; // 1 min left
    const result = calculateAntiSnippingExtension(baseEnd, bidTime);

    expect(result.shouldExtend).toBe(true);
    expect(result.addedMs).toBe(5 * 60 * 1000);
    expect(result.newEndTimeMs).toBe(baseEndMs + 5 * 60 * 1000);
  });

  it("extends auction by 5 minutes if bid is placed exactly 2 minutes before end", () => {
    const bidTime = baseEndMs - ANTI_SNIPPING_THRESHOLD_MS; // 2 min left
    const result = calculateAntiSnippingExtension(baseEnd, bidTime);

    expect(result.shouldExtend).toBe(true);
    expect(result.addedMs).toBe(ANTI_SNIPPING_EXTENSION_MS);
    expect(result.newEndTimeMs).toBe(baseEndMs + ANTI_SNIPPING_EXTENSION_MS);
  });

  it("does not extend if bid is placed more than 2 minutes before end", () => {
    const bidTime = baseEndMs - (2 * 60 * 1000 + 1000); // 2 min 1 sec left
    const result = calculateAntiSnippingExtension(baseEnd, bidTime);

    expect(result.shouldExtend).toBe(false);
    expect(result.newEndTimeMs).toBe(baseEndMs);
  });

  it("does not extend if auction has already ended", () => {
    const bidTime = baseEndMs + 1000; // 1 sec after end
    const result = calculateAntiSnippingExtension(baseEnd, bidTime);

    expect(result.shouldExtend).toBe(false);
  });

  it("handles consecutive anti-snipping extensions", () => {
    const firstBid = baseEndMs - 30 * 1000; // 30 sec before first end
    const firstExtension = calculateAntiSnippingExtension(baseEnd, firstBid);
    expect(firstExtension.shouldExtend).toBe(true);

    // New end is baseEnd + 5 min
    const secondBid = firstExtension.newEndTimeMs! - 45 * 1000; // 45 sec before new end
    const secondExtension = calculateAntiSnippingExtension(
      firstExtension.newEndTime!,
      secondBid,
    );
    expect(secondExtension.shouldExtend).toBe(true);
    expect(secondExtension.newEndTimeMs).toBe(baseEndMs + 10 * 60 * 1000);
  });

  it("extends remaining seconds counter when within 120 seconds", () => {
    expect(calculateAntiSnippingSeconds(90)).toEqual({
      shouldExtend: true,
      newSeconds: 390, // 90 + 300
    });
    expect(calculateAntiSnippingSeconds(120)).toEqual({
      shouldExtend: true,
      newSeconds: 420, // 120 + 300
    });
    expect(calculateAntiSnippingSeconds(150)).toEqual({
      shouldExtend: false,
      newSeconds: 150,
    });
    expect(calculateAntiSnippingSeconds(0)).toEqual({
      shouldExtend: false,
      newSeconds: 0,
    });
  });

  it("safely handles null and invalid dates", () => {
    expect(calculateAntiSnippingExtension(null).shouldExtend).toBe(false);
    expect(calculateAntiSnippingExtension("invalid").shouldExtend).toBe(false);
  });
});
