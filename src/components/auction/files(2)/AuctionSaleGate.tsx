"use client";

import { useEffect, useState } from "react";
import type { AuctionBidEntry } from "@/components/auction/BidLedger";
import type { VehicleAuction } from "@/lib/auction/types";
import type { ChampagneLocale } from "@/locales/champagne";
import { AuctionSaleModal } from "./AuctionSaleModal";
import { normalizeCounterparty } from "./useUserById";
import { useAuctionCounterparty } from "@/queries/contracts";

/** Highest-amount bid in the ledger — used as a fallback if `highestBid` is empty. */
function topBid(bids: readonly AuctionBidEntry[]): AuctionBidEntry | null {
  return bids.reduce<AuctionBidEntry | null>(
    (max, bid) => (max === null || bid.amount > max.amount ? bid : max),
    null,
  );
}

// Backend creates the contract automatically after the auction ends. Keep the
// frontend read-only here so repeated renders cannot create a request loop.
// const contractNoticeCopy = {
//   uz: "Auksion yakunlandi. Shartnoma backendda yaratildi, savdo ma'lumotlarini ko'rishingiz mumkin.",
//   ru: "Аукцион завершён. Договор создан backend-сервисом, детали сделки доступны для просмотра.",
//   en: "The auction has ended. The contract was created by the backend, and the sale details are ready to view.",
// } as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function textId(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function unwrapCounterpartyPayload(value: unknown): Record<string, unknown> {
  const record = asRecord(value);
  const nested = asRecord(record.data);
  return Object.keys(nested).length > 0 ? nested : record;
}

function pickRoleCounterparty(
  value: unknown,
  role: "seller" | "winner",
  expectedId: string | null,
): unknown {
  const data = unwrapCounterpartyPayload(value);
  const direct =
    role === "seller"
      ? data.buyer ?? data.buyerDto ?? data.winner ?? data.winnerDto
      : data.seller ?? data.sellerDto;
  if (direct) return direct;

  const fallback = data.counterparty ?? data.user;
  const fallbackRecord = asRecord(fallback);
  const fallbackId = textId(fallbackRecord.id ?? fallbackRecord.userId);
  if (expectedId && fallbackId === expectedId) return fallback;
  return null;
}

export interface AuctionSaleGateProps {
  auctionId: string;
  auction: VehicleAuction;
  vehicleTitle: string;
  highestBid: AuctionBidEntry | null;
  bids: readonly AuctionBidEntry[];
  userId: string | null;
  locale: ChampagneLocale;
}

/**
 * Drop this once at the end of <LiveAuctionRoom>'s JSX:
 *
 *   <AuctionSaleGate
 *     auctionId={auctionId}
 *     auction={auction}
 *     vehicleTitle={localizedTitle}
 *     highestBid={highestBid}
 *     bids={bids}
 *     userId={userId}
 *     locale={locale}
 *   />
 *
 * It figures out on its own whether the current user is the seller or the
 * winning bidder of a closed auction, fetches the counterpart's contact
 * info, and renders the sale/contract modal — or renders nothing at all
 * for every other visitor.
 */
export function AuctionSaleGate({
  auctionId,
  auction,
  vehicleTitle,
  highestBid,
  bids,
  userId,
  locale,
}: AuctionSaleGateProps) {
  const sellerId = (auction.seller as { id?: string | number } | null)?.id;
  const sellerIdStr = sellerId !== undefined && sellerId !== null ? String(sellerId) : null;
  const winnerId =
    ((auction as VehicleAuction & { winnerId?: string | number | null }).winnerId !== undefined &&
    (auction as VehicleAuction & { winnerId?: string | number | null }).winnerId !== null
      ? String((auction as VehicleAuction & { winnerId?: string | number | null }).winnerId)
      : null) ??
    highestBid?.bidderId ??
    topBid(bids)?.bidderId ??
    null;

  const auctionEndedByStatus =
    auction.status === "ended" || auction.status === "sold";
  const auctionEndedByTime =
    typeof auction.endTime === "string" &&
    !Number.isNaN(Date.parse(auction.endTime)) &&
    // eslint-disable-next-line react-hooks/purity
    Date.parse(auction.endTime) <= Date.now();
  const auctionSold =
    Boolean(winnerId) && (auctionEndedByStatus || auctionEndedByTime);

  const myRole: "seller" | "winner" | null =
    !auctionSold || !userId
      ? null
      : sellerIdStr && userId === sellerIdStr
        ? "seller"
        : winnerId && userId === winnerId
          ? "winner"
          : null;

  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(false);
  }, [auctionId, userId]);

  const counterpartId = myRole === "seller" ? winnerId : myRole === "winner" ? sellerIdStr : null;
  const counterpartQuery = useAuctionCounterparty(myRole ? auctionId : null);

  const open = myRole !== null && !dismissed;

  // useEffect(() => {
  //   if (!open || !myRole || !userId) return;
  //   const storageKey = `auction-contract-notice:${auctionId}:${userId}`;
  //   if (typeof window === "undefined") return;
  //   if (window.localStorage.getItem(storageKey) === "sent") return;
  //
  //   createNotice.mutate(
  //     { title: contractNoticeCopy[locale], userId },
  //     {
  //       onSuccess: () => window.localStorage.setItem(storageKey, "sent"),
  //     },
  //   );
  // }, [auctionId, createNotice, locale, myRole, open, userId]);

  if (!open || !myRole) return null;

  const finalPrice = auction.finalPrice ?? highestBid?.amount ?? auction.currentPrice ?? null;
  const counterpartRecord = myRole
    ? pickRoleCounterparty(counterpartQuery.data, myRole, counterpartId)
    : null;
  const counterpart = counterpartRecord
    ? normalizeCounterparty(counterpartRecord, counterpartId ?? "")
    : null;
  const imageUrls = auction.images.map((image) => image.url).filter(Boolean);
  const regionName =
    auction.region?.name[locale] ??
    auction.region?.name.default ??
    auction.region?.name.uz ??
    auction.region?.name.ru ??
    auction.region?.name.en ??
    null;

  return (
    <AuctionSaleModal
      open={open}
      role={myRole}
      locale={locale}
      vehicleTitle={vehicleTitle}
      lotNumber={auction.lotNumber ?? auction.id}
      currency={auction.currency}
      finalPrice={finalPrice}
      imageUrls={imageUrls}
      vehicleYear={auction.year}
      mileage={auction.mileage}
      regionName={regionName}
      counterpart={counterpart}
      counterpartKnown={!counterpartQuery.isLoading && !counterpartQuery.isError}
      onClose={() => setDismissed(true)}
    />
  );
}
