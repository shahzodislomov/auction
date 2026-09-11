"use client";

import { useMemo } from "react";

import {
  SellerVehicleDetailSection,
  SellerVehiclesSection,
  type SellerAuctionSummary,
} from "@/components/cabinet/CabinetLiveSections";
import { useAuctionByVehicle } from "@/queries/auction-listings";

const statusPriority: Record<string, number> = {
  LIVE: 5,
  SCHEDULED: 4,
  DRAFT: 3,
  FINISHED: 2,
  CANCELED: 1,
};

export function auctionVehicleId(auction: SellerAuctionSummary): string {
  return String(auction.vehicleId ?? auction.vehicle?.vehicleId ?? "").trim();
}

export function preferredAuctionsByVehicle(auctions: readonly SellerAuctionSummary[]) {
  const result = new Map<string, SellerAuctionSummary>();

  for (const auction of auctions) {
    const vehicleId = auctionVehicleId(auction);
    const auctionId = auction.auctionId ?? auction.id;
    if (!vehicleId || auctionId === null || auctionId === undefined) continue;

    const current = result.get(vehicleId);
    const nextPriority = statusPriority[String(auction.status ?? "").toUpperCase()] ?? 0;
    const currentPriority = statusPriority[String(current?.status ?? "").toUpperCase()] ?? 0;
    if (!current || nextPriority > currentPriority) result.set(vehicleId, auction);
  }

  return result;
}

export function SellerListingsSection({ userId }: { userId?: string | number }) {
  return <SellerVehiclesSection userId={userId} />;
}

export function SellerListingDetailSection({
  userId,
  vehicleId,
}: {
  userId?: string | number;
  vehicleId: string;
}) {
  const auctionQuery = useAuctionByVehicle(vehicleId);
  const auction = useMemo(() => auctionQuery.data as SellerAuctionSummary | undefined, [auctionQuery.data]);

  return <SellerVehicleDetailSection auction={auction} auctionLoading={auctionQuery.isLoading} userId={userId} vehicleId={vehicleId} />;
}
