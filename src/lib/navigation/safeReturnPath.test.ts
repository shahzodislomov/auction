import { describe, expect, it } from "vitest";

import { safeReturnPath } from "@/lib/navigation/safeReturnPath";

describe("safeReturnPath", () => {
  it.each([
    "/safe/..//evil.example/path",
    "/safe/%2e%2e//evil.example/path",
    "/safe/../%2f%2fevil.example/path",
  ])("rejects a path that normalizes to a protocol-relative URL: %s", (value) => {
    expect(safeReturnPath(value)).toBe("/");
  });

  it("preserves a normalized same-origin path with its query and hash", () => {
    expect(safeReturnPath("/auctions/../sell?resume=vehicle#details")).toBe(
      "/sell?resume=vehicle#details",
    );
  });
});
