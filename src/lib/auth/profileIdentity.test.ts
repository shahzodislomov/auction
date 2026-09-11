import { describe, expect, it } from "vitest";

import {
  isSameAccountIdentity,
  resolveProfileIdentity,
} from "@/lib/auth/profileIdentity";

describe("authenticated profile identity", () => {
  it("accepts a positive integer id or legacy userId", () => {
    expect(resolveProfileIdentity({ id: 41 })).toBe(41);
    expect(resolveProfileIdentity({ userId: "41" })).toBe(41);
  });

  it("rejects absent, sentinel, fractional, negative, and opaque identities", () => {
    expect(resolveProfileIdentity(undefined)).toBeNull();
    expect(resolveProfileIdentity({ id: "  " })).toBeNull();
    expect(resolveProfileIdentity({ id: Number.NaN })).toBeNull();
    expect(resolveProfileIdentity({ id: 0 })).toBeNull();
    expect(resolveProfileIdentity({ id: "0" })).toBeNull();
    expect(resolveProfileIdentity({ id: -1 })).toBeNull();
    expect(resolveProfileIdentity({ id: 4.2 })).toBeNull();
    expect(resolveProfileIdentity({ id: "buyer-41" })).toBeNull();
  });

  it("compares numeric and serialized versions of the same account", () => {
    expect(isSameAccountIdentity(41, "41")).toBe(true);
    expect(isSameAccountIdentity(41, "99")).toBe(false);
  });

  it("fails closed when id aliases conflict or either explicit alias is invalid", () => {
    expect(resolveProfileIdentity({ id: 41, userId: 99 })).toBeNull();
    expect(resolveProfileIdentity({ id: "41", userId: 41 })).toBe(41);
    expect(resolveProfileIdentity({ id: 41, userId: "" })).toBeNull();
    expect(resolveProfileIdentity({ id: null, userId: 41 })).toBeNull();
  });
});
