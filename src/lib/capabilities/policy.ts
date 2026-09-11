import type { AuctionCapability } from "@/lib/auction/types";

export type CapabilityState = "live" | "demo" | "unavailable";

export function getCapabilityState(
  capability: AuctionCapability,
  options: {
    nodeEnv: string;
    liveCapabilities: readonly AuctionCapability[];
  },
): CapabilityState {
  if (options.liveCapabilities.includes(capability)) return "live";
  return options.nodeEnv === "production" ? "unavailable" : "demo";
}
