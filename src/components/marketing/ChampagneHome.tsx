"use client";

import { useMemo } from "react";

import { HomeHeroCarousel } from "@/components/home/HomeHeroCarousel";
import { HomeFeatureGrid } from "@/components/home/HomeFeatureGrid";
import { AdminSupportCard } from "@/components/home/AdminSupportCard";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { HomeSections } from "@/components/marketing/HomeSections";
import { selectVehicleAuctions } from "@/lib/auction/selectVehicleAuctions";
import { useAuctions } from "@/queries/auction-listings";

export function ChampagneHome() {
  const auctionsQuery = useAuctions({ approvalStatus: "APPROVED", page: 0, size: 20 });
  const auctions = useMemo(
    () => selectVehicleAuctions(auctionsQuery.data ?? []),
    [auctionsQuery.data],
  );
  const featuredAuction = auctions.find(
    (auction) =>
      auction.status === "live" || auction.status === "ending-soon",
  );
  const apiBackedAuctions =
    Array.isArray(auctionsQuery.data) && auctionsQuery.data.length > 0 ? auctions : [];
  const isInitialLoading = auctionsQuery.isLoading && auctionsQuery.data === undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/25 via-surface-canvas to-amber-50/15 pb-16">
      {/* 1. Large Hero Carousel */}
      <HomeHeroCarousel />

      {/* 2. Main Feature & Action Cards */}
      <HomeFeatureGrid />

      {/* 3. Admin Support / Question Card */}
      <AdminSupportCard />

      {/* 4. Vehicle Search Filter Form */}
      <HeroSearch auctions={auctions} />

      {/* 5. Existing Marketplace & Auction Sections */}
      <HomeSections
        auction={featuredAuction}
        auctions={apiBackedAuctions}
        isError={auctionsQuery.isError}
        isRefreshing={auctionsQuery.isFetching}
        isLoading={isInitialLoading}
        onRetry={() => void auctionsQuery.refetch()}
      />
    </div>
  );
}
