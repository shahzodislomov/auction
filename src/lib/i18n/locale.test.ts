import { describe, expect, it } from "vitest";

import {
  buildLocaleHref,
  localizedRouteHref,
  resolveChampagneLocale,
} from "@/lib/i18n/locale";

describe("Champagne locale routing", () => {
  it("prefers a valid request locale and otherwise restores the persisted locale", () => {
    expect(resolveChampagneLocale("ru", "en")).toBe("ru");
    expect(resolveChampagneLocale("invalid", "en")).toBe("en");
    expect(resolveChampagneLocale(null, null)).toBe("uz");
  });

  it("updates only lang while preserving a safe path, query, and hash", () => {
    expect(
      buildLocaleHref(
        "/auctions/42",
        new URLSearchParams("make=Chevrolet&lang=en&page=2"),
        "ru",
        "#bids",
      ),
    ).toBe("/auctions/42?make=Chevrolet&lang=ru&page=2#bids");
  });

  it("does not turn an untrusted pathname or hash into an external navigation", () => {
    expect(
      buildLocaleHref(
        "https://malicious.example/collect",
        new URLSearchParams("next=https://malicious.example"),
        "en",
        "https://malicious.example/#fragment",
      ),
    ).toBe("/?next=https%3A%2F%2Fmalicious.example&lang=en");
  });

  it("builds a self-canonical localized route", () => {
    expect(localizedRouteHref("/sold", "en")).toBe("/sold?lang=en");
  });
});
