"use client";

import { ArrowRight, CarFront } from "lucide-react";
import Link from "next/link";
import { useIntl } from "react-intl";

import { AuctionCard } from "@/components/auction/AuctionCard";
import { StatePanel } from "@/components/feedback/StatePanel";
import { AuctionCardGridSkeleton, FeaturedAuctionSkeleton } from "@/components/feedback/ContentSkeletons";
import { FeaturedAuction } from "@/components/marketing/FeaturedAuction";
import { FinishedAuctionEvidence } from "@/components/marketing/FinishedAuctionEvidence";
import { TrustLedger } from "@/components/marketing/TrustLedger";
import { Button } from "@/components/ui/Button";
import type { VehicleAuction } from "@/lib/auction/types";

export interface HomeSectionsProps {
  auction?: VehicleAuction;
  auctions: readonly VehicleAuction[];
  isError?: boolean;
  isRefreshing?: boolean;
  isLoading?: boolean;
  onRetry?: () => void;
}

function endingTimestamp(auction: VehicleAuction): number {
  if (!auction.endTime) return Number.MAX_SAFE_INTEGER;
  const timestamp = Date.parse(auction.endTime);
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}

export function HomeSections({
  auction,
  auctions,
  isError,
  isRefreshing,
  isLoading,
  onRetry,
}: HomeSectionsProps) {
  const intl = useIntl();
  const endingSoonAuctions = auctions
    .filter((candidate) => candidate.status === "ending-soon")
    .sort((left, right) => endingTimestamp(left) - endingTimestamp(right))
    .slice(0, 3);
  const finishedAuctions = auctions
    .filter(
      (candidate) =>
        (candidate.status === "sold" || candidate.status === "ended") &&
        candidate.finalPrice !== null &&
        Number.isFinite(candidate.finalPrice) &&
        candidate.finalPrice >= 0,
    )
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-[91.125rem] px-[var(--content-gutter)] pb-12 pt-[1.125rem]">
      <section aria-labelledby="featured-auction-heading">
        <h2
          id="featured-auction-heading"
          className="inline-block border-b-2 border-brand-champagne-500 pb-1 text-base font-extrabold uppercase leading-5 tracking-[0.02em] text-brand-navy-900"
        >
          {intl.formatMessage({ id: "home.featuredTitle" })}
        </h2>
        <div className="mt-3">
          {isLoading && !auction ? (
            <FeaturedAuctionSkeleton label={intl.formatMessage({ id: "home.loadingTitle" })} />
          ) : auction ? (
            <>
              {isError ? (
                <div className="mb-3 flex flex-col gap-3 rounded-md border border-semantic-warning/35 bg-semantic-warning-surface p-3 text-sm text-text-primary sm:flex-row sm:items-center sm:justify-between" role="status">
                  <p className="font-semibold">
                    {intl.formatMessage({ id: "home.staleWarning" })}
                  </p>
                  {onRetry ? (
                    <Button
                      className="shrink-0"
                      disabled={isRefreshing}
                      onClick={onRetry}
                      variant="outline"
                    >
                      {intl.formatMessage({ id: "action.retry" })}
                    </Button>
                  ) : null}
                </div>
              ) : null}
              <FeaturedAuction auction={auction} />
            </>
          ) : (
            <StatePanel
              action={
                isError && onRetry ? (
                  <Button
                    disabled={isRefreshing}
                    onClick={onRetry}
                    variant="outline"
                  >
                    {intl.formatMessage({ id: "action.retry" })}
                  </Button>
                ) : undefined
              }
              title={intl.formatMessage({
                id: isLoading
                  ? "home.loadingTitle"
                  : isError
                    ? "home.errorTitle"
                    : "home.featuredFallbackTitle",
              })}
              description={intl.formatMessage({
                id: isError
                  ? "home.errorDescription"
                  : "home.featuredFallbackDescription",
              })}
            />
          )}
        </div>
      </section>

      {isLoading || endingSoonAuctions.length ? (
        <section aria-labelledby="ending-soon-heading" className="mt-12">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-gold-text">
                {intl.formatMessage({ id: "home.endingSoonEyebrow" })}
              </p>
              <h2
                className="mt-2 font-display text-2xl font-bold tracking-[-0.025em] text-brand-navy-900 md:text-3xl"
                id="ending-soon-heading"
              >
                {intl.formatMessage({ id: "home.endingSoonTitle" })}
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary md:text-base">
                {intl.formatMessage({ id: "home.endingSoonDescription" })}
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              href="/auctions?status=ending-soon"
            >
              {intl.formatMessage({ id: "home.endingSoonAction" })}
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
          <div className="mt-5">
            {isLoading ? (
              <AuctionCardGridSkeleton count={3} label={intl.formatMessage({ id: "home.loadingTitle" })} />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {endingSoonAuctions.map((endingAuction) => (
                  <AuctionCard auction={endingAuction} key={endingAuction.id} />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      <TrustLedger />

      <FinishedAuctionEvidence auctions={finishedAuctions} isLoading={isLoading} />

      <section
        aria-labelledby="seller-invitation-heading"
        className="mt-12 overflow-hidden rounded-2xl md:rounded-3xl border border-brand-navy-800 bg-brand-navy-900 text-white shadow-[0_8px_28px_rgb(4_18_43_/_0.1)]"
      >
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-10">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-champagne-500 text-brand-navy-950 shadow-sm">
              <CarFront aria-hidden="true" size={23} />
            </span>
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-champagne-500">
                {intl.formatMessage({ id: "home.sellEyebrow" })}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.025em]" id="seller-invitation-heading">
                {intl.formatMessage({ id: "home.sellTitle" })}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/75 md:text-base">
                {intl.formatMessage({ id: "home.sellDescription" })}
              </p>
            </div>
          </div>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-champagne-500 px-6 text-sm font-extrabold text-brand-navy-950 shadow-md transition-all hover:bg-brand-champagne-600 hover:shadow-lg active:scale-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
            href="/sell"
          >
            {intl.formatMessage({ id: "home.sellAction" })}
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
