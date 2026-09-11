import { describe, expect, it } from "vitest";

import {
  buildLocalizedRouteMetadata,
  resolveMetadataBase,
} from "@/lib/seo/siteMetadata";

describe("localized route metadata", () => {
  it("uses the active locale as canonical and publishes every language alternate", () => {
    const metadata = buildLocalizedRouteMetadata("auctions", "ru");

    expect(metadata.title).toBe("Автомобильные аукционы | TezAuksion");
    expect(metadata.alternates).toEqual({
      canonical: "/auctions?lang=ru",
      languages: {
        uz: "/auctions?lang=uz",
        ru: "/auctions?lang=ru",
        en: "/auctions?lang=en",
        "x-default": "/auctions?lang=uz",
      },
    });
    expect(metadata.openGraph).toMatchObject({
      locale: "ru_RU",
      url: "/auctions?lang=ru",
    });
  });

  it("returns a production HTTPS origin when the configured site URL is unsafe", () => {
    expect(resolveMetadataBase("javascript:alert(1)").href).toBe(
      "https://tezauksion.uz/",
    );
    expect(resolveMetadataBase("https://auction.example.uz/path").href).toBe(
      "https://auction.example.uz/",
    );
  });
});
