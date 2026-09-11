import type { Metadata } from "next";

import {
  localeAlternates,
  localizedRouteHref,
} from "@/lib/i18n/locale";
import type { ChampagneLocale } from "@/locales/champagne";

const FALLBACK_SITE_URL = "https://tezauksion.uz";

const localeTags: Record<ChampagneLocale, string> = {
  uz: "uz_UZ",
  ru: "ru_RU",
  en: "en_US",
};

const routeDefinitions = {
  home: {
    path: "/",
    copy: {
      uz: {
        title: "TezAuksion | Avtomobil auksionlari",
        description:
          "Mavjud lotlarni qidiring, taqdim etilgan avtomobil ma’lumotlarini solishtiring va savdo holatini kuzating.",
      },
      ru: {
        title: "TezAuksion | Автомобильные аукционы",
        description:
          "Ищите доступные лоты, сравнивайте предоставленные сведения об автомобилях и следите за ходом торгов.",
      },
      en: {
        title: "TezAuksion | Vehicle auctions",
        description:
          "Search available lots, compare supplied vehicle details, and follow auction status.",
      },
    },
  },
  auctions: {
    path: "/auctions",
    copy: {
      uz: {
        title: "Avtomobil auksionlari | TezAuksion",
        description:
          "Mavjud avtomobil lotlarini qidiring, saralang va taqdim etilgan tafsilotlarini solishtiring.",
      },
      ru: {
        title: "Автомобильные аукционы | TezAuksion",
        description:
          "Ищите и сортируйте доступные автомобильные лоты и сравнивайте предоставленные сведения.",
      },
      en: {
        title: "Vehicle auctions | TezAuksion",
        description:
          "Search and sort available vehicle lots and compare their supplied details.",
      },
    },
  },
  sold: {
    path: "/sold",
    copy: {
      uz: {
        title: "Sotilgan avtomobillar arxivi | TezAuksion",
        description:
          "Yakunlangan avtomobil auksionlarida taqdim etilgan sotuv narxlari va sanalari.",
      },
      ru: {
        title: "Архив проданных автомобилей | TezAuksion",
        description:
          "Предоставленные цены продажи и даты завершённых автомобильных аукционов.",
      },
      en: {
        title: "Sold vehicle archive | TezAuksion",
        description:
          "Sale prices and dates supplied by completed vehicle auction listings.",
      },
    },
  },
} as const;

export type LocalizedMetadataRoute = keyof typeof routeDefinitions;

function configuredSiteUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    undefined
  );
}

export function resolveMetadataBase(
  configured = configuredSiteUrl(),
): URL {
  if (configured) {
    try {
      const candidate = new URL(
        /^[a-z][a-z\d+.-]*:/i.test(configured)
          ? configured
          : `https://${configured}`,
      );
      if (
        candidate.protocol === "https:" &&
        !candidate.username &&
        !candidate.password
      ) {
        return new URL(candidate.origin);
      }
    } catch {
      // Use the known production origin below.
    }
  }

  return new URL(FALLBACK_SITE_URL);
}

export function buildLocalizedRouteMetadata(
  route: LocalizedMetadataRoute,
  locale: ChampagneLocale,
): Metadata {
  const definition = routeDefinitions[route];
  const localizedUrl = localizedRouteHref(definition.path, locale);
  const localizedCopy = definition.copy[locale];

  return {
    title: localizedCopy.title,
    description: localizedCopy.description,
    alternates: {
      canonical: localizedUrl,
      languages: localeAlternates(definition.path),
    },
    openGraph: {
      type: "website",
      siteName: "TezAuksion",
      locale: localeTags[locale],
      alternateLocale: Object.values(localeTags).filter(
        (tag) => tag !== localeTags[locale],
      ),
      url: localizedUrl,
      title: localizedCopy.title,
      description: localizedCopy.description,
    },
  };
}
