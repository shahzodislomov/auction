import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));

vi.mock("@/components/auction/AuctionDetail", () => ({
  AuctionDetail: ({ auctionId }: { auctionId: string }) => (
    <div data-testid="auction-detail">{auctionId}</div>
  ),
}));

import AuctionDetailPage from "./page";

const auction = {
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

describe("auction detail structured data", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ data: auction }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("matches the requested UI locale and localized canonical URL", async () => {
    const page = await AuctionDetailPage({
      params: Promise.resolve({ id: "901" }),
      searchParams: Promise.resolve({ lang: "ru" }),
    });

    render(page);

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script?.textContent ?? "{}")).toMatchObject({
      inLanguage: "ru-RU",
      name: "2024 Chevrolet Malibu",
      url: "/auctions/901?lang=ru",
    });
  });

  it("decodes a dynamic route id before loading and rendering the auction", async () => {
    const page = await AuctionDetailPage({
      params: Promise.resolve({ id: "TA%2042" }),
      searchParams: Promise.resolve({}),
    });

    render(page);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/auctions\/TA%2042$/),
      expect.any(Object),
    );
    expect(screen.getByTestId("auction-detail")).toHaveTextContent("TA 42");
  });
});
