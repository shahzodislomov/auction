import { describe, expect, it } from "vitest";

import { userAccountFilterValue } from "./ConnectedAdminWorkspace";

describe("admin user account filters", () => {
  it("normalizes boolean and enum account states", () => {
    expect(userAccountFilterValue({ isActive: true })).toBe("ACTIVE");
    expect(userAccountFilterValue({ isActive: false })).toBe("INACTIVE");
    expect(userAccountFilterValue({ blocked: true })).toBe("INACTIVE");
    expect(userAccountFilterValue({ accountStatus: "BLOCKED" })).toBe("INACTIVE");
    expect(userAccountFilterValue({ accountStatus: "ACTIVE" })).toBe("ACTIVE");
  });
});
