import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CHAMPAGNE_LOCALE_STORAGE_KEY } from "@/locales/champagne";

vi.mock("@/components/auction/LiveAuctionRoom", () => ({
  LiveAuctionRoom: ({ auctionId }: { auctionId: string }) =>
    createElement("div", { "data-testid": "live-room" }, auctionId),
}));

import LiveAuctionPage, { generateMetadata } from "./page";

const headerMocks = vi.hoisted(() => ({
  cookies: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: headerMocks.cookies,
}));

const liveAuction = {
  auctionId: 901,
  vehicleId: 44,
  status: "LIVE",
  vehicle: {
    vehicleId: 44,
    year: 2024,
    makeName: "Chevrolet",
    modelName: "Malibu",
  },
  currentPrice: 240_000_000,
  startPrice: 200_000_000,
  currency: "UZS",
};

function metadataProps(
  id = "901",
  searchParams: Record<string, string | string[] | undefined> = {},
) {
  return {
    params: Promise.resolve({ id }),
    searchParams: Promise.resolve(searchParams),
  };
}

describe("live auction metadata", () => {
  beforeEach(() => {
    headerMocks.cookies.mockResolvedValue({ get: () => undefined });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ data: liveAuction }),
      })),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("restores the persisted locale when the live URL has no language query", async () => {
    headerMocks.cookies.mockResolvedValue({
      get: (key: string) =>
        key === CHAMPAGNE_LOCALE_STORAGE_KEY ? { value: "en" } : undefined,
    });

    const metadata = await generateMetadata(metadataProps());

    expect(metadata.title).toBe("Live · 2024 Chevrolet Malibu | TezAuksion");
  });

  it("uses the live route in Open Graph URL and title metadata", async () => {
    const metadata = await generateMetadata(metadataProps("901", { lang: "en" }));

    expect(metadata.alternates?.canonical).toBe(
      "/auctions/901/live?lang=en",
    );
    expect(metadata.openGraph).toMatchObject({
      title: "Live · 2024 Chevrolet Malibu | TezAuksion",
      url: "/auctions/901/live?lang=en",
    });
  });

  it("renders localized Vehicle JSON-LD for the live route", async () => {
    const page = await LiveAuctionPage(
      metadataProps("901", { lang: "ru" }),
    );

    render(page);

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script?.textContent ?? "{}")).toMatchObject({
      inLanguage: "ru-RU",
      name: "2024 Chevrolet Malibu",
      url: "/auctions/901/live?lang=ru",
    });
  });

  it("decodes a dynamic route id before loading and rendering the live room", async () => {
    const page = await LiveAuctionPage(metadataProps("TA%2042"));

    render(page);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/auctions\/TA%2042$/),
      expect.any(Object),
    );
    expect(screen.getByTestId("live-room")).toHaveTextContent("TA 42");
  });

  it("prevents indexing when the requested vehicle auction is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));

    const metadata = await generateMetadata(metadataProps("missing"));

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
