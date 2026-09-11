import { describe, expect, it } from "vitest";

import { getCapabilityState } from "@/lib/capabilities/policy";

describe("getCapabilityState", () => {
  it("keeps an unavailable production capability honest", () => {
    expect(
      getCapabilityState("kyc", {
        nodeEnv: "production",
        liveCapabilities: [],
      }),
    ).toBe("unavailable");
  });

  it("allows a missing capability to use its development demo", () => {
    expect(
      getCapabilityState("kyc", {
        nodeEnv: "development",
        liveCapabilities: [],
      }),
    ).toBe("demo");
  });

  it("prefers a live capability in every environment", () => {
    expect(
      getCapabilityState("kyc", {
        nodeEnv: "production",
        liveCapabilities: ["kyc"],
      }),
    ).toBe("live");
  });
});
