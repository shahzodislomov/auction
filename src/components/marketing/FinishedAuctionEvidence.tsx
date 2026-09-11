"use client";

import { ArrowUpRight, Gavel } from "lucide-react";
import Link from "next/link";
import { useContext } from "react";
import { useIntl } from "react-intl";

import { LangSwitch } from "@/context/LangSwitch";
import type { LocalizedText, VehicleAuction } from "@/lib/auction/types";
import { formatAuctionPrice } from "@/lib/formatting/auction";
import { auctionDetailHref } from "@/lib/routing/auctionRouteId";
import { AuctionCardGridSkeleton } from "@/components/feedback/ContentSkeletons";

export interface FinishedAuctionEvidenceProps {
  auctions: readonly VehicleAuction[];
  isLoading?: boolean;
}

function localizeText(
  text: LocalizedText,
  locale: "en" | "ru" | "uz",
): string {
  return text[locale] ?? text.default ?? text.uz ?? text.ru ?? text.en ?? "";
}

export function FinishedAuctionEvidence({
  auctions,
  isLoading = false,
}: FinishedAuctionEvidenceProps) {
  const intl = useIntl();
  const { currentLang } = useContext(LangSwitch);

  if (!isLoading && !auctions.length) return null;

  return (
    <section aria-labelledby="finished-auction-evidence-heading" className="mt-12">
      <div className="max-w-2xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-gold-text">
          {intl.formatMessage({ id: "home.finishedEyebrow" })}
        </p>
        <h2
          className="mt-2 font-display text-2xl font-bold tracking-[-0.025em] text-brand-navy-900 md:text-3xl"
          id="finished-auction-evidence-heading"
        >
          {intl.formatMessage({ id: "home.finishedTitle" })}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary md:text-base">
          {intl.formatMessage({ id: "home.finishedDescription" })}
        </p>
      </div>

      {isLoading ? (
        <div className="mt-5">
          <AuctionCardGridSkeleton count={3} label={intl.formatMessage({ id: "home.loadingTitle" })} />
        </div>
      ) : <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {auctions.map((auction) => {
          const title =
            localizeText(auction.title, currentLang) ||
            intl.formatMessage(
              { id: "lot.number" },
              { number: auction.lotNumber ?? auction.id },
            );

          return (
            <article
              className="flex min-h-56 flex-col rounded-lg border border-border-default bg-white p-5 shadow-[0_10px_28px_rgb(4_18_43_/_0.05)]"
              key={auction.id}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-brand-gold-text">
                  {intl.formatMessage(
                    { id: "lot.number" },
                    { number: auction.lotNumber ?? auction.id },
                  )}
                </p>
                <Gavel aria-hidden="true" className="text-text-secondary" size={18} />
              </div>
              <h3 className="mt-4 text-xl font-extrabold leading-tight text-brand-navy-900">
                {title}
              </h3>
              <dl className="mt-5 border-t border-border-default pt-4">
                <dt className="text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">
                  {intl.formatMessage({ id: "lot.finalPrice" })}
                </dt>
                <dd className="mt-1 text-xl font-extrabold tabular-nums text-brand-navy-900">
                  {formatAuctionPrice(auction.finalPrice, {
                    currency: auction.currency,
                  })}
                </dd>
              </dl>
              <Link
                aria-label={`${intl.formatMessage({ id: "action.viewResult" })}: ${title}`}
                className="mt-auto inline-flex min-h-11 items-center justify-between gap-2 border-t border-border-default pt-4 text-sm font-extrabold text-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                href={auctionDetailHref(auction.id)}
              >
                {intl.formatMessage({ id: "action.viewResult" })}
                <ArrowUpRight aria-hidden="true" size={17} />
              </Link>
            </article>
          );
        })}
      </div>}
    </section>
  );
}
