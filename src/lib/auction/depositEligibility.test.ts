import { describe, expect, it } from "vitest";
import {
  checkDepositCutoff,
  DEPOSIT_CUTOFF_THRESHOLD_MS,
  DEPOSIT_CUTOFF_THRESHOLD_SECONDS,
  isAuctionStarted,
} from "./depositEligibility";

describe("depositEligibility utility", () => {
  it("exports the 5-minute constants correctly", () => {
    expect(DEPOSIT_CUTOFF_THRESHOLD_MS).toBe(5 * 60 * 1000);
    expect(DEPOSIT_CUTOFF_THRESHOLD_SECONDS).toBe(300);
  });

  describe("isAuctionStarted", () => {
    it("recognizes live and ending-soon statuses as started", () => {
      expect(isAuctionStarted({ status: "live" })).toBe(true);
      expect(isAuctionStarted({ status: "ending-soon" })).toBe(true);
    });

    it("evaluates start time timestamp against current clock when status is not upcoming", () => {
      const startTime = "2026-09-10T12:00:00.000Z";
      const beforeStart = new Date("2026-09-10T11:59:00.000Z").getTime();
      const afterStart = new Date("2026-09-10T12:01:00.000Z").getTime();

      expect(isAuctionStarted({ startTime }, beforeStart)).toBe(false);
      expect(isAuctionStarted({ startTime }, afterStart)).toBe(true);
      expect(isAuctionStarted({ status: "upcoming", startTime }, afterStart)).toBe(false);
    });
  });

  describe("checkDepositCutoff", () => {
    it("allows deposit when auction has not started yet (upcoming)", () => {
      const now = new Date("2026-09-10T10:00:00.000Z").getTime();
      const result = checkDepositCutoff({
        status: "upcoming",
        startTime: "2026-09-10T11:00:00.000Z",
        endTime: "2026-09-10T12:00:00.000Z",
        now,
      });

      expect(result.isStarted).toBe(false);
      expect(result.isCutoffReached).toBe(false);
    });

    it("allows deposit after auction starts if remaining time is > 5 minutes", () => {
      const now = new Date("2026-09-10T10:30:00.000Z").getTime();
      const result = checkDepositCutoff({
        status: "live",
        startTime: "2026-09-10T10:00:00.000Z",
        endTime: "2026-09-10T10:40:00.000Z", // 10 minutes remaining
        now,
      });

      expect(result.isStarted).toBe(true);
      expect(result.isCutoffReached).toBe(false);
      expect(result.remainingMs).toBe(10 * 60 * 1000);
    });

    it("blocks deposit after auction starts if remaining time is <= 5 minutes (e.g. 4 minutes)", () => {
      const now = new Date("2026-09-10T10:36:00.000Z").getTime();
      const result = checkDepositCutoff({
        status: "live",
        startTime: "2026-09-10T10:00:00.000Z",
        endTime: "2026-09-10T10:40:00.000Z", // 4 minutes remaining
        now,
      });

      expect(result.isStarted).toBe(true);
      expect(result.isCutoffReached).toBe(true);
      expect(result.remainingMs).toBe(4 * 60 * 1000);
    });

    it("blocks deposit if remaining time is exactly 5 minutes (300 seconds)", () => {
      const result = checkDepositCutoff({
        status: "live",
        remainingSeconds: 300,
      });

      expect(result.isStarted).toBe(true);
      expect(result.isCutoffReached).toBe(true);
    });

    it("allows deposit if remaining time is 301 seconds (> 5 minutes)", () => {
      const result = checkDepositCutoff({
        status: "live",
        remainingSeconds: 301,
      });

      expect(result.isStarted).toBe(true);
      expect(result.isCutoffReached).toBe(false);
    });

    it("handles invalid or missing times safely", () => {
      expect(checkDepositCutoff({ status: "live", endTime: null })).toEqual({
        isStarted: true,
        isCutoffReached: false,
        remainingMs: null,
      });

      expect(checkDepositCutoff({ status: "live", endTime: "invalid-date" })).toEqual({
        isStarted: true,
        isCutoffReached: false,
        remainingMs: null,
      });
    });
  });
});
