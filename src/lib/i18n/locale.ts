import {
  CHAMPAGNE_LOCALE_STORAGE_KEY,
  champagneLocales,
  isChampagneLocale,
  type ChampagneLocale,
} from "@/locales/champagne";

export const CHAMPAGNE_LOCALE_REQUEST_HEADER = "x-tezauksion-locale";

const acceptLanguageByLocale: Record<ChampagneLocale, string> = {
  en: "en, en-US;q=0.9",
  ru: "ru, ru-RU;q=0.9",
  uz: "uz, uz-UZ;q=0.9",
};

export function resolveChampagneLocale(
  ...candidates: Array<string | null | undefined>
): ChampagneLocale {
  return (
    candidates.find(
      (candidate): candidate is ChampagneLocale =>
        isChampagneLocale(candidate ?? null),
    ) ?? "uz"
  );
}

function safePathname(pathname: string | null | undefined): string {
  if (
    !pathname ||
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    pathname.includes("\\") ||
    /[\r\n]/.test(pathname)
  ) {
    return "/";
  }

  return pathname;
}

export function localizedRouteHref(
  pathname: string,
  locale: ChampagneLocale,
): string {
  const safePath = safePathname(pathname);
  return `${safePath}?lang=${locale}`;
}

export function buildLocaleHref(
  pathname: string | null | undefined,
  searchParams: Pick<URLSearchParams, "toString"> | null | undefined,
  locale: ChampagneLocale,
  hash = "",
): string {
  const params = new URLSearchParams(searchParams?.toString() ?? "");
  params.set("lang", locale);
  const safeHash = hash.startsWith("#") && !/[\r\n]/.test(hash) ? hash : "";

  return `${safePathname(pathname)}?${params.toString()}${safeHash}`;
}

export function persistBrowserLocale(locale: ChampagneLocale): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CHAMPAGNE_LOCALE_STORAGE_KEY, locale);
    window.localStorage.setItem("language", locale);
    window.localStorage.setItem("lang", locale);
    window.localStorage.setItem("locale", locale);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }

  document.cookie = `${CHAMPAGNE_LOCALE_STORAGE_KEY}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  document.cookie = `language=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  document.cookie = `lang=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  document.cookie = `locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function preferredAcceptLanguage(locale: string | null | undefined): string {
  return acceptLanguageByLocale[resolveChampagneLocale(locale)];
}

export function readPreferredAcceptLanguage(): string {
  if (typeof window === "undefined") return preferredAcceptLanguage("uz");

  try {
    return preferredAcceptLanguage(
      window.localStorage.getItem(CHAMPAGNE_LOCALE_STORAGE_KEY) ??
        window.localStorage.getItem("language"),
    );
  } catch {
    return preferredAcceptLanguage("uz");
  }
}

export function localeAlternates(pathname: string) {
  const languages = Object.fromEntries(
    champagneLocales.map((locale) => [
      locale,
      localizedRouteHref(pathname, locale),
    ]),
  ) as Record<ChampagneLocale, string> & { "x-default": string };

  languages["x-default"] = localizedRouteHref(pathname, "uz");
  return languages;
}
