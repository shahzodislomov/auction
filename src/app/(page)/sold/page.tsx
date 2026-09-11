import type { Metadata } from "next";
import { CalendarCheck2, Gavel, MapPin } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { selectVehicleAuctions } from "@/lib/auction/selectVehicleAuctions";
import type { VehicleAuction } from "@/lib/auction/types";
import { formatAuctionPrice, formatMileage } from "@/lib/formatting/auction";
import {
  resolvePageLocale,
  type LocaleSearchParams,
} from "@/lib/i18n/serverLocale";
import { buildLocalizedRouteMetadata } from "@/lib/seo/siteMetadata";
import { auctionDetailHref } from "@/lib/routing/auctionRouteId";
import type { ChampagneLocale } from "@/locales/champagne";
import { SoldVehicleCarousel } from "./SoldVehicleCarousel";

type SoldPageProps = {
  searchParams: Promise<LocaleSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: SoldPageProps): Promise<Metadata> {
  return buildLocalizedRouteMetadata(
    "sold",
    await resolvePageLocale(await searchParams),
  );
}

const copy = {
  uz: {
    eyebrow: "Bozor dalillari",
    title: "Sotilgan avtomobillar arxivi",
    body: "Yakunlangan auksionlarning haqiqiy sotuv narxlari va sanalari.",
    soldFor: "Sotuv narxi",
    soldOn: "Yakunlangan sana",
    mileage: "Yurgan masofa",
    details: "Natijani ko‘rish",
    empty: "Hozircha yakunlangan avtomobil auksionlari yo‘q.",
    error: "Sotilgan avtomobillar arxivini yuklab bo‘lmadi.",
    retry: "Qayta urinish",
    imageUnavailable: "Avtomobil rasmi mavjud emas",
    sold: "Sotilgan",
  },
  ru: {
    eyebrow: "Рыночные данные",
    title: "Архив проданных автомобилей",
    body: "Фактические цены и даты завершённых автомобильных аукционов.",
    soldFor: "Цена продажи",
    soldOn: "Дата завершения",
    mileage: "Пробег",
    details: "Посмотреть результат",
    empty: "Завершённых автомобильных аукционов пока нет.",
    error: "Не удалось загрузить архив проданных автомобилей.",
    retry: "Повторить",
    imageUnavailable: "Изображение автомобиля недоступно",
    sold: "Продано",
  },
  en: {
    eyebrow: "Market evidence",
    title: "Sold vehicle archive",
    body: "Observed sale prices and dates from completed vehicle auctions.",
    soldFor: "Sold for",
    soldOn: "Completed",
    mileage: "Mileage",
    details: "View result",
    empty: "No completed vehicle auctions are available yet.",
    error: "The sold vehicle archive could not be loaded.",
    retry: "Try again",
    imageUnavailable: "Vehicle image unavailable",
    sold: "Sold",
  },
} as const;

const localeTags: Record<ChampagneLocale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

function localized(
  value: VehicleAuction["title"],
  locale: ChampagneLocale,
): string | null {
  return value[locale] ?? value.default ?? value.uz ?? value.ru ?? value.en;
}

type VerifiedSoldAuction = VehicleAuction & {
  finalPrice: number;
};

function hasVerifiedSoldOutcome(
  auction: VehicleAuction,
): auction is VerifiedSoldAuction {
  return (
    auction.status === "sold" &&
    auction.finalPrice !== null &&
    Number.isFinite(auction.finalPrice) &&
    auction.finalPrice >= 0
  );
}

async function loadSoldAuctions(): Promise<
  | { status: "ok"; auctions: VerifiedSoldAuction[] }
  | { status: "error"; auctions: [] }
> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "https://api.tezauksion.uz";
  try {
    const response = await fetch(
      `${apiUrl}/auctions?page=0&size=100&status=FINISHED&approvalStatus=APPROVED`,
      { cache: "no-store", headers: { Accept: "application/json" } },
    );
    if (!response.ok) return { status: "error", auctions: [] };
    const payload = (await response.json()) as {
      data?: unknown[] | { dtoList?: unknown[]; content?: unknown[] };
      meta?: { list?: unknown[]; dtoList?: unknown[]; content?: unknown[] };
    };
    const data = payload.data;
    const auctionDtos = Array.isArray(data)
      ? data
      : data?.dtoList ??
        data?.content ??
        payload.meta?.list ??
        payload.meta?.dtoList ??
        payload.meta?.content ??
        [];
    const auctions = selectVehicleAuctions(auctionDtos, {
      allowDemo: false,
    }).filter(hasVerifiedSoldOutcome);
    return { status: "ok", auctions };
  } catch {
    return { status: "error", auctions: [] };
  }
}

export default async function SoldArchivePage({
  searchParams,
}: SoldPageProps) {
  const query = await searchParams;
  const locale = await resolvePageLocale(query);
  const labels = copy[locale];
  const soldResult = await loadSoldAuctions();
  const auctions = soldResult.auctions;

  return (
    <div className="mx-auto w-full max-w-7xl px-[var(--content-gutter)] py-10 md:py-16">
      <header className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-gold-text">
          {labels.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-brand-navy-900 md:text-5xl">
          {labels.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-text-secondary">
          {labels.body}
        </p>
      </header>

      {soldResult.status === "error" ? (
        <div className="mt-10 rounded-lg border border-semantic-danger/30 bg-semantic-danger-surface p-8 text-center">
          <p className="font-bold text-semantic-danger" role="alert">
            {labels.error}
          </p>
          <Link
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-border-default bg-surface-primary px-5 font-bold text-brand-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            href={locale === "uz" ? "/sold" : `/sold?lang=${locale}`}
          >
            {labels.retry}
          </Link>
        </div>
      ) : auctions.length === 0 ? (
        <div className="mt-10 rounded-lg border border-border-default bg-surface-primary p-8 text-center text-text-secondary">
          {labels.empty}
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {auctions.map((auction) => {
            const title = localized(auction.title, locale) ?? `Auction ${auction.id}`;
            const location = auction.region
              ? localized(auction.region.name, locale)
              : null;
            return (
              <article
                key={auction.id}
                className="overflow-hidden rounded-lg border border-border-default bg-surface-primary shadow-sticky"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                  <SoldVehicleCarousel
                    alt={title}
                    fallbackAlt={labels.imageUnavailable}
                    fallbackImages={auction.images}
                    vehicleId={auction.vehicleId}
                  />
                  <StatusBadge tone="neutral" className="absolute left-4 top-4">
                    <Gavel aria-hidden="true" size={14} />
                    {labels.sold}
                  </StatusBadge>
                </div>
                <div className="p-5">
                  <h2 className="font-display text-xl font-bold leading-snug text-brand-navy-900">
                    {title}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-text-secondary">
                    {location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin aria-hidden="true" size={15} />
                        {location}
                      </span>
                    ) : null}
                    {auction.mileage !== null ? (
                      <span>
                        {labels.mileage}: {formatMileage(auction.mileage, localeTags[locale])}
                      </span>
                    ) : null}
                  </div>
                  <dl className="mt-5 rounded-md bg-surface-muted p-4">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm font-bold text-text-secondary">
                        {labels.soldFor}
                      </dt>
                      <dd className="text-right font-bold tabular-nums text-brand-navy-900">
                        {formatAuctionPrice(auction.finalPrice, {
                          currency: auction.currency,
                          locale: localeTags[locale],
                        })}
                      </dd>
                    </div>
                    {auction.endTime ? (
                      <div className="mt-3 flex items-center justify-between gap-4 border-t border-border-default pt-3">
                        <dt className="flex items-center gap-1.5 text-sm text-text-secondary">
                          <CalendarCheck2 aria-hidden="true" size={15} />
                          {labels.soldOn}
                        </dt>
                        <dd className="text-right text-sm font-bold tabular-nums text-text-primary">
                          {new Intl.DateTimeFormat(localeTags[locale], {
                            dateStyle: "medium",
                          }).format(new Date(auction.endTime))}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  <Link
                    href={auctionDetailHref(auction.id)}
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-brand-champagne-500 bg-brand-champagne-500 px-4 py-2 font-bold text-brand-navy-900 transition-colors hover:bg-brand-champagne-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  >
                    {labels.details}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
