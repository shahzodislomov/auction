import { describe, expect, it } from "vitest";
import {
  parseUzbekistanDate,
  parseUzbekistanTimestamp,
  UZBEKISTAN_TIMEZONE,
} from "./date";

describe("uzbekistanDate formatting utilities", () => {
  it("preserves Tashkent wall-time when ISO string lacks timezone offset", () => {
    const d = parseUzbekistanDate("2026-09-07T19:19:00");
    expect(Number.isFinite(d.getTime())).toBe(true);

    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: UZBEKISTAN_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);

    expect(formatted).toBe("19:19");
  });

  it("handles UTC strings with trailing Z", () => {
    const d = parseUzbekistanDate("2026-09-07T14:19:00.000Z");
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: UZBEKISTAN_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);

    expect(formatted).toBe("19:19");
  });

  it("handles explicit timezone offsets", () => {
    const d = parseUzbekistanDate("2026-09-07T19:19:00+05:00");
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: UZBEKISTAN_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);

    expect(formatted).toBe("19:19");
  });

  it("safely handles null, undefined, empty or invalid strings", () => {
    expect(Number.isNaN(parseUzbekistanTimestamp(null))).toBe(true);
    expect(Number.isNaN(parseUzbekistanTimestamp(undefined))).toBe(true);
    expect(Number.isNaN(parseUzbekistanTimestamp(""))).toBe(true);
    expect(Number.isNaN(parseUzbekistanTimestamp("invalid-date"))).toBe(true);
  });
});
