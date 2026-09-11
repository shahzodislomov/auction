import type { Metadata } from "next";

import type { VehicleAuction } from "@/lib/auction/types";
import {
  localeAlternates,
  localizedRouteHref,
} from "@/lib/i18n/locale";
import type { ChampagneLocale } from "@/locales/champagne";

const localeTags: Record<ChampagneLocale, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

const openGraphLocaleTags: Record<ChampagneLocale, string> = {
  uz: "uz_UZ",
  ru: "ru_RU",
  en: "en_US",
};

const auctionFallbackLabels: Record<ChampagneLocale, string> = {
  uz: "Auksion",
  ru: "Аукцион",
  en: "Auction",
};

type AuctionMetadataOptions = {
  canonicalPath?: string;
  titlePrefix?: string;
};

type VehicleStructuredDataOptions = {
  canonicalPath?: string;
};

function localizedText(
  value: VehicleAuction["title"],
  locale: ChampagneLocale,
): string | null {
  return value[locale] ?? value.default ?? value.uz ?? value.ru ?? value.en;
}

function verifiedPrice(auction: VehicleAuction): number | null {
  const candidates =
    auction.status === "sold" || auction.status === "ended"
      ? [auction.finalPrice]
      : auction.status === "live" ||
          auction.status === "ending-soon" ||
          auction.status === "upcoming"
        ? [auction.currentPrice, auction.startPrice]
        : [];

  return (
    candidates.find(
      (value): value is number =>
        value !== null && Number.isFinite(value) && value >= 0,
    ) ?? null
  );
}

function priceText(
  auction: VehicleAuction,
  locale: ChampagneLocale,
): string | null {
  const price = verifiedPrice(auction);
  if (price === null || auction.currency === "unknown") return null;

  return new Intl.NumberFormat(localeTags[locale], {
    style: "currency",
    currency: auction.currency,
    currencyDisplay: "code",
    maximumFractionDigits: auction.currency === "UZS" ? 0 : 2,
  }).format(price);
}

export function buildAuctionMetadata(
  auction: VehicleAuction,
  locale: ChampagneLocale,
  options: AuctionMetadataOptions = {},
): Metadata {
  const vehicleName = [auction.year, auction.make, auction.model]
    .filter(Boolean)
    .join(" ");
  const rawTitle = localizedText(auction.title, locale);
  const name =
    (rawTitle && !rawTitle.toLowerCase().startsWith("auction"))
      ? rawTitle
      : vehicleName || rawTitle || `${auctionFallbackLabels[locale]} ${auction.id}`;
  const suppliedDescription = localizedText(auction.description, locale);
  const price = priceText(auction, locale);
  const facts = [auction.year, auction.make, auction.model]
    .filter((value) => value !== null)
    .join(" ");
  const description = [suppliedDescription, facts || null, price]
    .filter((value): value is string => Boolean(value))
    .join(" · ");
  const canonicalPath =
    options.canonicalPath ?? `/auctions/${encodeURIComponent(auction.id)}`;
  const localizedUrl = localizedRouteHref(canonicalPath, locale);
  const firstImage = auction.images[0];
  const title = `${options.titlePrefix ? `${options.titlePrefix} · ` : ""}${name} | TezAuksion`;

  return {
    title,
    ...(description ? { description } : {}),
    alternates: {
      canonical: localizedUrl,
      languages: localeAlternates(canonicalPath),
    },
    openGraph: {
      type: "website",
      locale: openGraphLocaleTags[locale],
      alternateLocale: Object.values(openGraphLocaleTags).filter(
        (tag) => tag !== openGraphLocaleTags[locale],
      ),
      url: localizedUrl,
      title,
      ...(description ? { description } : {}),
      ...(firstImage
        ? {
            images: [
              {
                url: firstImage.url,
                alt: localizedText(firstImage.alt, locale) ?? name,
              },
            ],
          }
        : {}),
    },
  };
}

export function buildVehicleStructuredData(
  auction: VehicleAuction,
  locale: ChampagneLocale,
  options: VehicleStructuredDataOptions = {},
): Record<string, unknown> {
  const name =
    localizedText(auction.title, locale) ??
    `${auctionFallbackLabels[locale]} ${auction.id}`;
  const price = verifiedPrice(auction);
  const canonicalPath =
    options.canonicalPath ?? `/auctions/${encodeURIComponent(auction.id)}`;
  const canonical = localizedRouteHref(canonicalPath, locale);
  const additionalProperty: Array<Record<string, unknown>> = [];

  if (auction.inspection && auction.inspection.status !== "unknown") {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Inspection status",
      value: auction.inspection.status,
      ...(auction.inspection.score !== null
        ? { maxValue: 100, valueReference: auction.inspection.score }
        : {}),
    });
  }

  if (auction.seller?.verified !== null && auction.seller?.verified !== undefined) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Seller verification",
      value: auction.seller.verified ? "verified" : "not verified",
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    inLanguage: localeTags[locale],
    url: canonical,
    name,
    ...(auction.images.length > 0
      ? { image: auction.images.map((image) => image.url) }
      : {}),
    ...(auction.vin ? { vehicleIdentificationNumber: auction.vin } : {}),
    ...(auction.make
      ? { brand: { "@type": "Brand", name: auction.make } }
      : {}),
    ...(auction.model ? { model: auction.model } : {}),
    ...(auction.year ? { vehicleModelDate: String(auction.year) } : {}),
    ...(auction.mileage !== null
      ? {
          mileageFromOdometer: {
            "@type": "QuantitativeValue",
            value: auction.mileage,
            unitCode: "KMT",
          },
        }
      : {}),
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
    ...(price !== null && auction.currency !== "unknown"
      ? {
          offers: {
            "@type": "Offer",
            url: canonical,
            price,
            priceCurrency: auction.currency,
            availability:
              auction.status === "sold" || auction.status === "ended"
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
            ...(auction.seller?.verified === true && auction.seller.name
              ? {
                  seller: {
                    "@type": "Organization",
                    name: auction.seller.name,
                  },
                }
              : {}),
          },
        }
      : {}),
  };
}
