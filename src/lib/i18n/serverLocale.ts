import { cookies, headers } from "next/headers";

import {
  CHAMPAGNE_LOCALE_REQUEST_HEADER,
  resolveChampagneLocale,
} from "@/lib/i18n/locale";
import {
  CHAMPAGNE_LOCALE_STORAGE_KEY,
  type ChampagneLocale,
} from "@/locales/champagne";

export type LocaleSearchParams = Record<
  string,
  string | string[] | undefined
>;

function requestedLocale(
  searchParams: LocaleSearchParams | null | undefined,
): string | null {
  const lang = searchParams?.lang;
  return (Array.isArray(lang) ? lang[0] : lang) ?? null;
}

export async function resolvePageLocale(
  searchParams: LocaleSearchParams | null | undefined,
): Promise<ChampagneLocale> {
  const cookieStore = await cookies();

  return resolveChampagneLocale(
    requestedLocale(searchParams),
    cookieStore.get(CHAMPAGNE_LOCALE_STORAGE_KEY)?.value,
  );
}

export async function resolveRootLocale(): Promise<ChampagneLocale> {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);

  return resolveChampagneLocale(
    headerStore.get(CHAMPAGNE_LOCALE_REQUEST_HEADER),
    cookieStore.get(CHAMPAGNE_LOCALE_STORAGE_KEY)?.value,
  );
}
