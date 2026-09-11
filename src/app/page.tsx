import type { Metadata } from "next";

import { ChampagneHome } from "@/components/marketing/ChampagneHome";
import {
  resolvePageLocale,
  type LocaleSearchParams,
} from "@/lib/i18n/serverLocale";
import { buildLocalizedRouteMetadata } from "@/lib/seo/siteMetadata";

type HomePageProps = {
  searchParams: Promise<LocaleSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  return buildLocalizedRouteMetadata(
    "home",
    await resolvePageLocale(await searchParams),
  );
}

export default function HomePage() {
  return <ChampagneHome />;
}
