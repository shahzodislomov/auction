"use client";

import {
  CalendarDays,
  CarFront,
  Clock,
  Fuel,
  Gauge,
  Heart,
  MapPin,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

import { Button } from "@/components/ui/Button";
import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import { LangSwitch } from "@/context/LangSwitch";
import { useUserContext } from "@/context/UserContext";
import type {
  AuctionStatus,
  LocalizedText,
  VehicleAuction,
} from "@/lib/auction/types";
import { formatAuctionPrice, formatMileage } from "@/lib/formatting/auction";
import { findCanonicalRegion } from "@/lib/regions";
import {
  parseUzbekistanDate,
  parseUzbekistanTimestamp,
  UZBEKISTAN_TIMEZONE,
} from "@/lib/formatting/date";
import { useLikedLots, useLikeLotMutation } from "@/queries/lots";

export interface AuctionCardProps {
  auction: VehicleAuction;
}

const statusTones: Record<AuctionStatus, StatusBadgeTone> = {
  live: "success",
  "ending-soon": "warning",
  upcoming: "info",
  sold: "neutral",
  ended: "neutral",
  cancelled: "danger",
  unknown: "neutral",
};

const localeTags = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" } as const;

function localizeText(text: LocalizedText, locale: "uz" | "ru" | "en") {
  return text[locale] ?? text.default ?? text.uz ?? text.ru ?? text.en ?? "";
}

function auctionRoute(auction: VehicleAuction) {
  return auction.status === "live" || auction.status === "ending-soon"
    ? `/auctions/${auction.id}/live`
    : `/auctions/${auction.id}`;
}

function remainingTime(targetTime: string | null, now: number | null) {
  if (!targetTime || now === null) return null;
  const target = parseUzbekistanTimestamp(targetTime);
  if (Number.isNaN(target)) return null;
  const milliseconds = Math.max(0, target - now);
  if (milliseconds <= 0) return "00:00:00";
  const seconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  if (days > 0) {
    return `${days}d ${[hours, minutes, remainingSeconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":")}`;
  }
  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function useRemainingTime(targetTime: string | null) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!targetTime || Number.isNaN(parseUzbekistanTimestamp(targetTime))) return;
    const update = () => setNow(Date.now());
    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, [targetTime]);
  return remainingTime(targetTime, now);
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const intl = useIntl();
  const router = useRouter();
  const { currentLang } = useContext(LangSwitch);
  const localeTag = localeTags[currentLang];
  const title = localizeText(auction.title, currentLang);
  const rawRegionText = auction.region
    ? localizeText(auction.region.name, currentLang)
    : null;
  const canonicalRegion = findCanonicalRegion(rawRegionText);
  const region = canonicalRegion
    ? (currentLang === "ru"
        ? canonicalRegion.ru
        : currentLang === "en"
          ? canonicalRegion.en
          : canonicalRegion.uz)
    : rawRegionText &&
        !["string", "null", "undefined", "none", "-"].includes(
          rawRegionText.toLowerCase().trim(),
        )
      ? rawRegionText
      : intl.formatMessage({ id: "lot.unknown" });
  const hasFinalPrice =
    (auction.status === "sold" || auction.status === "ended") &&
    auction.finalPrice !== null &&
    auction.finalPrice !== undefined;
  const price = hasFinalPrice
    ? auction.finalPrice
    : (auction.currentPrice ?? auction.startPrice);
  const priceLabel = hasFinalPrice
    ? intl.formatMessage({ id: "lot.finalPrice" })
    : auction.currentPrice !== null
      ? intl.formatMessage({ id: "lot.currentPrice" })
      : intl.formatMessage({ id: "lot.startPrice" });
  const countdown = useRemainingTime(auction.endTime);
  const startCountdown = useRemainingTime(auction.startTime);

  const formattedEndTime = auction.endTime ? (() => {
    try {
      const d = parseUzbekistanDate(auction.endTime);
      return isNaN(d.getTime()) ? null : d.toLocaleTimeString(
        currentLang === "ru" ? "ru-RU" : currentLang === "en" ? "en-US" : "uz-UZ",
        {
          timeZone: UZBEKISTAN_TIMEZONE,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      );
    } catch { return null; }
  })() : null;

  const formattedStartTime = auction.startTime ? (() => {
    try {
      const d = parseUzbekistanDate(auction.startTime);
      return isNaN(d.getTime()) ? null : d.toLocaleString(
        currentLang === "ru" ? "ru-RU" : currentLang === "en" ? "en-US" : "uz-UZ",
        {
          timeZone: UZBEKISTAN_TIMEZONE,
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      );
    } catch { return null; }
  })() : null;

  const destination = auctionRoute(auction);

  const fuelString = typeof auction.fuel === "string" ? auction.fuel.toLocaleLowerCase("en-US") : "";
  const fuelKey = fuelString.includes("diesel")
    ? "value.diesel"
    : fuelString.includes("hybrid")
      ? "value.hybrid"
      : fuelString.includes("petrol")
        ? "value.petrol"
        : null;

  const images = Array.isArray(auction.images) ? auction.images : [];
  const rawAuction = auction as unknown as Record<string, unknown>;
  const activeImage =
    images[0] ||
    (typeof rawAuction.image === "string" || typeof rawAuction.image === "object" ? rawAuction.image : null) ||
    (typeof rawAuction.imageUrl === "string" ? rawAuction.imageUrl : null) ||
    (typeof rawAuction.mainImage === "string" || typeof rawAuction.mainImage === "object" ? rawAuction.mainImage : null) ||
    null;
  const rawImgObj = activeImage && typeof activeImage === "object" ? (activeImage as Record<string, unknown>) : null;
  const activeImageUrlRaw =
    typeof activeImage === "string"
      ? activeImage
      : (typeof rawImgObj?.url === "string" ? rawImgObj.url : null) ||
        (typeof rawImgObj?.imagePath === "string" ? rawImgObj.imagePath : null) ||
        (typeof rawImgObj?.path === "string" ? rawImgObj.path : null) ||
        null;
  const activeImageUrl = activeImageUrlRaw
    ? (activeImageUrlRaw.startsWith("http") || activeImageUrlRaw.startsWith("data:") || activeImageUrlRaw.startsWith("blob:")
        ? activeImageUrlRaw
        : `https://api.tezauksion.uz${activeImageUrlRaw.startsWith("/") ? "" : "/"}${activeImageUrlRaw}`)
    : null;

  const { isAuthenticated, user } = useUserContext();
  const storageUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const effectiveUserId = (user as { id?: string | number } | null)?.id ?? storageUserId ?? null;

  const currentUserIdRef = useRef(effectiveUserId);
  useEffect(() => {
    currentUserIdRef.current = effectiveUserId;
  }, [effectiveUserId]);

  const { data: likedLots } = useLikedLots(
    effectiveUserId !== null && effectiveUserId !== undefined ? String(effectiveUserId) : undefined,
  );
  const likeLotMutation = useLikeLotMutation();

  const [overrideState, setOverrideState] = useState<{
    isLiked: boolean;
    userId: string | number;
    lotId: string | number;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const prevAuctionIdRef = useRef(auction.id);
  useEffect(() => {
    if (prevAuctionIdRef.current !== auction.id) {
      prevAuctionIdRef.current = auction.id;
      setOverrideState(null);
      setStatusMessage(null);
    }
  }, [auction.id]);

  const isLiked =
    overrideState &&
    String(overrideState.lotId) === String(auction.id) &&
    String(overrideState.userId) === String(effectiveUserId)
      ? overrideState.isLiked
      : Array.isArray(likedLots)
        ? (likedLots as Array<{ id?: string | number; auctionId?: string | number; lotId?: string | number }>).some(
            (lot) =>
              String(lot?.id ?? lot?.auctionId ?? lot?.lotId) === String(auction.id) ||
              Number(lot?.id ?? lot?.auctionId ?? lot?.lotId) === Number(auction.id),
          )
        : false;

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !effectiveUserId) {
      router.push("/login");
      return;
    }

    const requestUserId = effectiveUserId;
    const previousState = isLiked;
    setOverrideState({
      isLiked: !previousState,
      userId: requestUserId,
      lotId: auction.id,
    });

    (likeLotMutation as unknown as {
      mutate: (
        vars: { lotId: string | number; userId: string; isLiked: boolean; lotData?: unknown },
        opts: Record<string, unknown>,
      ) => void;
    }).mutate(
      { lotId: auction.id, userId: String(requestUserId), isLiked: previousState, lotData: auction },
      {
        onSuccess: (data: Record<string, unknown> | null | undefined) => {
          if (String(currentUserIdRef.current) !== String(requestUserId)) {
            return;
          }
          if (data?.status === "ERROR") {
            setOverrideState({
              isLiked: previousState,
              userId: requestUserId,
              lotId: auction.id,
            });
            setStatusMessage("The server did not confirm the watchlist state.");
            return;
          }
          const isLikedResponse =
            data?.liked === true ||
            (typeof data?.message === "string" && data.message.includes("Liked")) ||
            data?.status === "LIKED";
          const isUnlikedResponse =
            data?.liked === false ||
            data?.unliked === true ||
            (typeof data?.message === "string" && data.message.includes("Unliked")) ||
            data?.status === "UNLIKED";

          if (isLikedResponse) {
            setOverrideState({
              isLiked: true,
              userId: requestUserId,
              lotId: auction.id,
            });
            setStatusMessage("Saved to your watchlist.");
          } else if (isUnlikedResponse) {
            setOverrideState({
              isLiked: false,
              userId: requestUserId,
              lotId: auction.id,
            });
            setStatusMessage("Removed from your watchlist.");
          } else {
            setOverrideState({
              isLiked: previousState,
              userId: requestUserId,
              lotId: auction.id,
            });
            setStatusMessage("The server did not confirm the watchlist state.");
          }
        },
        onError: () => {
          if (String(currentUserIdRef.current) !== String(requestUserId)) {
            return;
          }
          setOverrideState({
            isLiked: previousState,
            userId: requestUserId,
            lotId: auction.id,
          });
          setStatusMessage("The server did not confirm the watchlist state.");
        },
      },
    );
  };

  const formattedEndDate = auction.endTime
    ? new Date(auction.endTime).toLocaleString(
        currentLang === "ru" ? "ru-RU" : currentLang === "en" ? "en-US" : "uz-UZ",
        { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true },
      )
    : null;

  return (
    <article className="group overflow-hidden rounded-lg border border-border-default bg-surface-primary shadow-[0_10px_28px_rgb(4_18_43_/_0.06)] transition-transform [transition-duration:var(--motion-standard)] hover:-translate-y-0.5">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f4f1eb]">
        <button
          aria-label={intl.formatMessage({
            id: isLiked ? "action.saved" : "action.save",
          })}
          aria-pressed={isLiked ? "true" : "false"}
          className="absolute right-3 top-3 z-20 flex min-h-9 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-brand-navy-900 shadow-md transition-all hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring cursor-pointer"
          onClick={handleToggleWatchlist}
          type="button"
        >
          <Heart
            aria-hidden="true"
            className={`h-4 w-4 transition-all duration-300 ${
              isLiked
                ? "fill-[#8B5A2B] text-[#8B5A2B] scale-110 drop-shadow-[0_2px_4px_rgba(139,90,43,0.3)]"
                : "fill-white text-text-secondary stroke-[2]"
            }`}
          />
          <span>
            {intl.formatMessage({
              id: isLiked ? "action.saved" : "action.save",
            })}
          </span>
        </button>
        {statusMessage ? (
          <span role="status" className="sr-only">
            {statusMessage}
          </span>
        ) : null}
        {activeImageUrl ? (
          <div
            aria-label={title}
            className="h-full w-full bg-contain bg-center bg-no-repeat"
            role="img"
            style={{ backgroundImage: `url('${activeImageUrl.replace(/'/g, "\\'")}')` }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <CarFront aria-hidden="true" className="text-brand-champagne-600" size={48} />
          </div>
        )}
        <StatusBadge
          tone={statusTones[auction.status]}
          className="absolute left-3 top-3 shadow-sm flex items-center gap-1.5"
        >
          {auction.status === "live" ? (
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-semantic-success opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-semantic-success" />
            </span>
          ) : auction.status === "upcoming" ? (
            <Clock aria-hidden="true" className="h-3.5 w-3.5 text-current animate-pulse shrink-0" />
          ) : null}
          <span>{intl.formatMessage({ id: `status.${auction.status}` })}</span>
          {auction.status === "upcoming" && startCountdown && startCountdown !== "00:00:00" ? (
            <span className="font-mono font-bold text-xs opacity-90 tabular-nums">
              • {startCountdown}
            </span>
          ) : null}
        </StatusBadge>
      </div>

      <div className="p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-brand-gold-text">
          {currentLang === "ru" ? "АУКЦИОН" : currentLang === "en" ? "AUCTION" : "AUKSION"} #{auction.id}
        </p>
        <h2 className="mt-2 line-clamp-2 text-xl font-extrabold leading-tight text-brand-navy-900">
          {title}
        </h2>

        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-text-secondary">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0" />
            <dt className="sr-only">
              {intl.formatMessage({ id: "filter.year" })}
            </dt>
            <dd>{auction.year ?? intl.formatMessage({ id: "lot.unknown" })}</dd>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Gauge aria-hidden="true" className="h-4 w-4 shrink-0" />
            <dt className="sr-only">
              {intl.formatMessage({ id: "lot.mileage" })}
            </dt>
            <dd className="truncate">
              {formatMileage(auction.mileage, localeTag)}
            </dd>
          </div>
          <div className="col-span-2 flex min-w-0 items-center gap-2">
            <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
            <dt className="sr-only">
              {intl.formatMessage({ id: "filter.region" })}
            </dt>
            <dd className="truncate">{region}</dd>
          </div>
          {fuelKey ? (
            <div className="col-span-2 flex min-w-0 items-center gap-2">
              <Fuel aria-hidden="true" className="h-4 w-4 shrink-0" />
              <dt className="sr-only">
                {intl.formatMessage({ id: "lot.fuel" })}
              </dt>
              <dd>{intl.formatMessage({ id: fuelKey })}</dd>
            </div>
          ) : null}
          {auction.inspection?.status === "passed" ? (
            <div className="col-span-2 flex min-w-0 items-center gap-2">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-semantic-success" />
              <dt className="sr-only">
                {intl.formatMessage({ id: "lot.condition" })}
              </dt>
              <dd className="font-bold text-semantic-success">
                {intl.formatMessage({ id: "lot.inspected" })}
              </dd>
            </div>
          ) : null}
          {auction.condition ? (
            <div className="col-span-2 flex min-w-0 items-center gap-2">
              <ClipboardCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
              <dt className="sr-only">
                {intl.formatMessage({ id: "lot.condition" })}
              </dt>
              <dd className="truncate capitalize">{String(auction.condition).toLowerCase()}</dd>
            </div>
          ) : null}
          {(auction.status === "ended" || auction.status === "sold") && formattedEndDate ? (
            <div className="col-span-2 flex min-w-0 items-center gap-2">
              <Clock aria-hidden="true" className="h-4 w-4 shrink-0" />
              <dt className="sr-only">
                {intl.formatMessage({ id: "filter.status" })}
              </dt>
              <dd className="truncate">
                {auction.status === "sold"
                  ? `Sold on ${formattedEndDate}`
                  : `Auction ended ${formattedEndDate}`}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-5 border-t border-border-default pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">
              {priceLabel}
            </p>
            <p className="mt-1 text-[1.35rem] font-extrabold leading-tight text-brand-navy-900">
              {formatAuctionPrice(price, {
                currency: auction.currency,
                locale: localeTag,
              })}
            </p>
          </div>
          {auction.status === "live" || auction.status === "ending-soon" ? (
            <div className="text-right flex flex-col items-end">
              {countdown && countdown !== "00:00:00" && countdown !== "00d 00h 00m 00s" && countdown !== "00:00" ? (
                <>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-semantic-warning">
                    {intl.formatMessage({ id: "lot.endsIn" })}
                  </p>
                  <p className="font-mono text-base font-extrabold text-brand-navy-900">
                    {countdown}
                  </p>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-semantic-success-surface px-2.5 py-1 text-xs font-bold text-semantic-success shadow-xs">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-semantic-success opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-semantic-success"></span>
                  </span>
                  {intl.formatMessage({ id: "status.live", defaultMessage: "В эфире" })}
                </span>
              )}
              {formattedEndTime ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded bg-brand-navy-900/5 px-2 py-0.5 text-[11px] font-extrabold text-brand-navy-900">
                  <Clock className="h-3.5 w-3.5 text-brand-champagne-600" />
                  {formattedEndTime}
                </span>
              ) : null}
            </div>
          ) : auction.status === "upcoming" ? (
            <div className="text-right flex flex-col items-end">
              {startCountdown && startCountdown !== "00:00:00" ? (
                <>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-champagne-700">
                    {intl.formatMessage({ id: "lot.startsIn", defaultMessage: "Auksion boshlanishiga" })}
                  </p>
                  <p className="font-mono text-base font-extrabold text-brand-navy-900 tabular-nums">
                    {startCountdown}
                  </p>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy-900/5 px-2.5 py-1 text-xs font-bold text-brand-navy-900 shadow-xs">
                  <Clock className="h-3.5 w-3.5 text-brand-champagne-600" />
                  {intl.formatMessage({ id: "status.upcoming", defaultMessage: "Kutilmoqda" })}
                </span>
              )}
              {formattedStartTime ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded bg-brand-navy-900/5 px-2 py-0.5 text-[11px] font-extrabold text-brand-navy-900">
                  <CalendarDays className="h-3.5 w-3.5 text-brand-champagne-600" />
                  {formattedStartTime}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          {auction.status === "live" || auction.status === "ending-soon" ? (
            <Button fullWidth onClick={() => router.push(destination)}>
              {intl.formatMessage({ id: "action.enterAuction" })}
            </Button>
          ) : (
            <Link
              href={destination}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border-default bg-surface-primary px-5 py-2.5 text-sm font-bold text-brand-navy-900 transition-colors hover:border-brand-navy-900 hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              {intl.formatMessage({
                id:
                  auction.status === "sold" || auction.status === "ended"
                    ? "action.viewResult"
                    : "action.viewLot",
              })}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
