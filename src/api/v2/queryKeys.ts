import type { AuctionId, PageRequest, VehicleId } from "./contracts";

export const v2QueryKeys = {
  root: ["v2"] as const,
  vehicles: {
    root: () => [...v2QueryKeys.root, "vehicles"] as const,
    list: (request: PageRequest) =>
      [...v2QueryKeys.vehicles.root(), "list", request] as const,
    detail: (vehicleId: VehicleId) =>
      [...v2QueryKeys.vehicles.root(), "detail", vehicleId] as const,
  },
  auctions: {
    root: () => [...v2QueryKeys.root, "auctions"] as const,
    list: (request: PageRequest) =>
      [...v2QueryKeys.auctions.root(), "list", request] as const,
    detail: (auctionId: AuctionId) =>
      [...v2QueryKeys.auctions.root(), "detail", auctionId] as const,
    bids: (auctionId: AuctionId) =>
      [...v2QueryKeys.auctions.detail(auctionId), "bids"] as const,
  },
};
