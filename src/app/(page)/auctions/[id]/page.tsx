import type { Metadata } from "next";

import { AuctionDetail } from "@/components/auction/AuctionDetail";
import { adaptAuction } from "@/lib/auction/adaptAuction";
import type { VehicleAuction } from "@/lib/auction/types";
import { resolvePageLocale } from "@/lib/i18n/serverLocale";
import {
  auctionIdPathSegment,
  decodeAuctionRouteParam,
} from "@/lib/routing/auctionRouteId";
import {
  buildAuctionMetadata,
  buildVehicleStructuredData,
} from "@/lib/seo/auctionMetadata";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadAuction(id: string): Promise<VehicleAuction | null> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "https://api.tezauksion.uz/";

  try {
    const response = await fetch(`${apiUrl}/auctions/${auctionIdPathSegment(id)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      const payload = (await response.json()) as { data?: unknown };
      const adapted = adaptAuction(payload.data);
      if (adapted) return adapted;
    }
  } catch {
    // The client renders an honest recovery state when the service is unavailable.
  }

  return null;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const auctionId = decodeAuctionRouteParam(id);
  const [auction, locale] = await Promise.all([
    loadAuction(auctionId),
    resolvePageLocale(query),
  ]);
  if (!auction) {
    return {
      title: `Avtomobil auksioni #${auctionId} | TezAuksion`,
      robots: { index: false, follow: false },
    };
  }
  return buildAuctionMetadata(auction, locale);
}

export default async function AuctionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const auctionId = decodeAuctionRouteParam(id);
  const [auction, locale] = await Promise.all([
    loadAuction(auctionId),
    resolvePageLocale(query),
  ]);
  const structuredData = auction
    ? buildVehicleStructuredData(auction, locale)
    : null;

  return (
    <>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c"),
          }}
        />
      ) : null}
      <AuctionDetail auctionId={auctionId} initialAuction={auction} />
    </>
  );
}
