"use client";

import {
  BadgeCheck,
  CircleGauge,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gavel,
  PaintRoller,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

import { Button } from "@/components/ui/Button";
import { LangSwitch } from "@/context/LangSwitch";
import { getNextBid } from "@/lib/auction/bidding";
import type { LocalizedText, VehicleAuction } from "@/lib/auction/types";
import { formatAuctionPrice, formatMileage } from "@/lib/formatting/auction";
import { parseUzbekistanTimestamp } from "@/lib/formatting/date";

export interface FeaturedAuctionProps {
  auction: VehicleAuction;
}

const localeTags = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" } as const;

function localizeText(text: LocalizedText, locale: "uz" | "ru" | "en") {
  return text[locale] ?? text.default ?? text.uz ?? text.ru ?? text.en ?? "";
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

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function FeaturedAuction({ auction }: FeaturedAuctionProps) {
  const intl = useIntl();
  const router = useRouter();
  const { currentLang } = useContext(LangSwitch);
  const destination =
    auction.status === "live" || auction.status === "ending-soon"
      ? `/auctions/${auction.id}/live`
      : `/auctions/${auction.id}`;
  const title = localizeText(auction.title, currentLang);
  const images = auction.images;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const prevImageCountRef = useRef(images.length);
  const visibleImageIndex = images.length ? activeImageIndex % images.length : 0;
  const activeImage = images[visibleImageIndex];
  const imageAlt = activeImage ? localizeText(activeImage.alt, currentLang) || title : title;
  const localeTag = localeTags[currentLang];
  const currentPrice =
    auction.currentPrice ?? auction.startPrice ?? auction.finalPrice;
  const nextPrice = getNextBid(auction, currentPrice);
  const countdownTarget = auction.status === "upcoming" ? (auction.startTime ?? auction.endTime) : auction.endTime;
  const countdown = useRemainingTime(countdownTarget);
  const metadata = [auction.drivetrain, auction.fuel, auction.transmission]
    .filter((value) => value && value !== "unknown")
    .join(" • ");

  useEffect(() => {
    if (prevImageCountRef.current === images.length) return;
    prevImageCountRef.current = images.length;
    setActiveImageIndex(0);
  }, [images.length]);

  useEffect(() => {
    if (carouselPaused || images.length < 2 || prefersReducedMotion()) return;
    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % images.length);
    }, 4_500);
    return () => window.clearInterval(interval);
  }, [carouselPaused, images.length]);

  const showPreviousImage = () => {
    setActiveImageIndex((current) => (current - 1 + images.length) % images.length);
  };
  const showNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % images.length);
  };

  return (
    <article className="grid overflow-hidden border border-border-default bg-white lg:grid-cols-[1.05fr_.92fr_1fr]">
      <div
        className="group relative min-h-72 overflow-hidden bg-surface-muted lg:min-h-[17.6rem]"
        onFocusCapture={() => setCarouselPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCarouselPaused(false);
        }}
        onMouseEnter={() => setCarouselPaused(true)}
        onMouseLeave={() => setCarouselPaused(false)}
      >
        {activeImage ? (
          <div
            aria-label={imageAlt}
            className="vehicle-carousel-image h-full min-h-72 w-full bg-cover bg-center lg:min-h-[17.6rem]"
            key={activeImage.url}
            role="img"
            style={{ backgroundImage: `url(${JSON.stringify(activeImage.url)})` }}
          />
        ) : (
          <div className="flex h-full min-h-72 items-center justify-center bg-[#f4f1eb] text-sm font-bold text-text-secondary lg:min-h-[17.6rem]">
            {title}
          </div>
        )}
        {images.length > 1 ? (
          <>
            <button
              aria-label={intl.formatMessage({ id: "lot.previousImage" })}
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-brand-navy-900/85 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              onClick={showPreviousImage}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={22} />
            </button>
            <button
              aria-label={intl.formatMessage({ id: "lot.nextImage" })}
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-brand-navy-900/85 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              onClick={showNextImage}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={22} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-brand-navy-900/85 px-2.5 py-1 text-xs font-bold text-white">
              {visibleImageIndex + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>

      <div className="border-t border-border-default p-5 lg:border-l lg:border-t-0 lg:px-7 lg:pb-4 lg:pt-2.5">
        <p className="inline-flex bg-[#f2e7d7] px-2 py-0.5 text-xs font-extrabold uppercase tracking-[0.05em] text-brand-gold-text">
          {intl.formatMessage(
            { id: "lot.number" },
            { number: auction.lotNumber ?? auction.id },
          )}
        </p>
        <h3 className="mt-2 text-xl font-extrabold leading-tight text-brand-navy-900">
          {title}
        </h3>
        <p className="mt-0.5 text-sm leading-5 text-text-secondary">
          {[auction.year, metadata].filter(Boolean).join(" • ")}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4">
          <div className="flex items-start gap-3">
            <CircleGauge aria-hidden="true" className="h-5 w-5 shrink-0" />
            <div>
              <dt className="sr-only">
                {intl.formatMessage({ id: "lot.mileage" })}
              </dt>
              <dd className="text-sm font-extrabold text-brand-navy-900">
                {formatMileage(auction.mileage, localeTag)}
              </dd>
              <p className="text-xs text-text-secondary">
                {intl.formatMessage({ id: "lot.mileage" })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Wrench aria-hidden="true" className="h-5 w-5 shrink-0" />
            <div>
              <dt className="sr-only">
                {intl.formatMessage({ id: "lot.condition" })}
              </dt>
              <dd className="text-sm font-extrabold text-brand-navy-900">
                {intl.formatMessage({ id: "lot.excellent" })}
              </dd>
              <p className="text-xs text-text-secondary">
                {intl.formatMessage({ id: "lot.condition" })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Fuel aria-hidden="true" className="h-5 w-5 shrink-0" />
            <div>
              <dt className="sr-only">
                {intl.formatMessage({ id: "lot.fuel" })}
              </dt>
              <dd className="text-sm font-extrabold text-brand-navy-900">
                {intl.formatMessage({
                  id: auction.fuel.includes("diesel")
                    ? "value.diesel"
                    : auction.fuel.includes("hybrid")
                      ? "value.hybrid"
                      : "value.petrol",
                })}
              </dd>
              <p className="text-xs text-text-secondary">
                {intl.formatMessage({ id: "lot.fuel" })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <PaintRoller aria-hidden="true" className="h-5 w-5 shrink-0" />
            <div>
              <dt className="sr-only">
                {intl.formatMessage({ id: "lot.body" })}
              </dt>
              <dd className="text-sm font-extrabold text-brand-navy-900">
                {intl.formatMessage({ id: "lot.clean" })}
              </dd>
              <p className="text-xs text-text-secondary">
                {intl.formatMessage({ id: "lot.body" })}
              </p>
            </div>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border border-border-default bg-[#f7f8f5] px-3 py-3 text-xs font-bold text-semantic-success">
          {auction.inspection?.status === "passed" ? (
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              {intl.formatMessage({ id: "lot.inspected" })}
            </span>
          ) : null}
          {auction.seller?.verified ? (
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck aria-hidden="true" className="h-4 w-4" />
              {intl.formatMessage({ id: "lot.sellerVerified" })}
            </span>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border-default p-5 lg:border-l lg:border-t-0 lg:px-6 lg:py-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.07em] text-text-secondary">
          {intl.formatMessage({ id: "lot.currentPrice" })}
        </p>
        <p className="mt-1 text-[clamp(1.65rem,2.1vw,2rem)] font-extrabold leading-tight tracking-[-0.03em] text-brand-navy-900">
          {formatAuctionPrice(currentPrice, {
            currency: auction.currency,
            locale: localeTag,
          })}
        </p>

        <dl className="mt-5 grid grid-cols-2 border-y border-border-default py-4">
          <div className="border-r border-border-default pr-4">
            <dt className="text-xs font-extrabold uppercase tracking-[0.06em] text-text-secondary">
              {intl.formatMessage({ id: auction.status === "upcoming" ? "lot.startsIn" : "lot.endsIn" })}
            </dt>
            <dd className="mt-1 text-2xl font-extrabold text-brand-navy-900">
              {countdown}
            </dd>
            <p className="text-xs text-text-secondary">
              {intl.formatMessage({ id: "lot.today" })}
            </p>
          </div>
          <div className="pl-4">
            <dt className="text-xs font-extrabold uppercase tracking-[0.06em] text-text-secondary">
              {intl.formatMessage({ id: "lot.nextBid" })}
            </dt>
            <dd className="mt-1 text-lg font-extrabold leading-tight text-brand-navy-900">
              {formatAuctionPrice(nextPrice, {
                currency: auction.currency,
                locale: localeTag,
              })}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <Button onClick={() => router.push(destination)}>
            <Gavel aria-hidden="true" className="h-5 w-5" />
            {intl.formatMessage({
              id:
                auction.status === "live" || auction.status === "ending-soon"
                  ? "action.enterAuction"
                  : "action.viewLot",
            })}
          </Button>
        </div>
      </div>
    </article>
  );
}
