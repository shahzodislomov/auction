import { Gavel } from "lucide-react";

import { Surface } from "@/components/ui/Surface";
import type { AuctionCurrency } from "@/lib/auction/types";
import { formatAuctionPrice } from "@/lib/formatting/auction";
import type { ChampagneLocale } from "@/locales/champagne";

export interface AuctionBidEntry {
  id: string;
  amount: number;
  timestamp: string;
  bidderId: string | null;
  bidderLabel: string;
}

const copy = {
  uz: { heading: "Takliflar daftari", empty: "Hozircha taklif yo‘q" },
  ru: { heading: "Журнал ставок", empty: "Ставок пока нет" },
  en: { heading: "Bid ledger", empty: "No bids yet" },
} as const;

const localeTags: Record<ChampagneLocale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

export function BidLedger({
  bids,
  currency,
  locale,
}: {
  bids: readonly AuctionBidEntry[];
  currency: AuctionCurrency;
  locale: ChampagneLocale;
}) {
  const labels = copy[locale];
  const sortedBids = [...bids].sort(
    (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp),
  );
  return (
    <Surface padding="none" className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border-default px-5 py-4">
        <Gavel aria-hidden="true" size={19} />
        <h2 className="font-display text-lg font-bold text-brand-navy-900">
          {labels.heading}
        </h2>
      </div>
      {sortedBids.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-text-secondary">
          {labels.empty}
        </p>
      ) : (
        <ol className="divide-y divide-border-default">
          {sortedBids.map((bid, index) => (
            <li
              key={bid.id}
              className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-5 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-brand-navy-900"
                >
                  {index + 1}
                </span>
                <span className="truncate text-sm font-bold text-text-primary">
                  {bid.bidderLabel}
                </span>
              </div>
              <span className="text-right font-bold tabular-nums text-brand-navy-900">
                {formatAuctionPrice(bid.amount, {
                  currency,
                  locale: localeTags[locale],
                })}
              </span>
              <time
                dateTime={bid.timestamp}
                className="col-span-2 pl-11 text-xs tabular-nums text-text-secondary sm:col-span-1 sm:col-start-1"
              >
                {new Intl.DateTimeFormat(localeTags[locale], {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(bid.timestamp))}
              </time>
            </li>
          ))}
        </ol>
      )}
    </Surface>
  );
}
