import type { Metadata } from "next";
import { Suspense } from "react";

import { AuctionDiscovery } from "@/components/auction/AuctionDiscovery";
import {
  resolvePageLocale,
  type LocaleSearchParams,
} from "@/lib/i18n/serverLocale";
import { buildLocalizedRouteMetadata } from "@/lib/seo/siteMetadata";

type AuctionsPageProps = {
  searchParams: Promise<LocaleSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: AuctionsPageProps): Promise<Metadata> {
  return buildLocalizedRouteMetadata(
    "auctions",
    await resolvePageLocale(await searchParams),
  );
}

export default function AuctionsPage() {
  return (
    <Suspense
      fallback={
        <div
          aria-busy="true"
          className="mx-auto min-h-[60dvh] max-w-[var(--content-max-width)] px-[var(--content-gutter)] py-12"
        >
          <div className="h-10 w-72 animate-pulse rounded-md bg-surface-muted" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="h-96 animate-pulse rounded-lg bg-surface-muted" />
            <div className="grid gap-5 md:grid-cols-2">
              <div className="h-[32rem] animate-pulse rounded-lg bg-surface-muted" />
              <div className="h-[32rem] animate-pulse rounded-lg bg-surface-muted" />
            </div>
          </div>
        </div>
      }
    >
      <AuctionDiscovery />
    </Suspense>
  );
}
