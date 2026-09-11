import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SoldArchivePage, { generateMetadata } from "./page";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));

describe("SoldArchivePage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          data: {
            dtoList: [
              {
                id: 301,
                lotType: { name: "CAR" },
                lotStatus: "SOLD",
                title: "Verified sold vehicle",
                finalPrice: 250_000_000,
                currentPrice: 240_000_000,
                currency: "UZS",
                endTime: "2026-07-15T12:00:00.000Z",
              },
              {
                id: 302,
                lotType: { name: "CAR" },
                lotStatus: "ENDED",
                title: "Generic ended vehicle",
                currentPrice: 180_000_000,
                currency: "UZS",
                endTime: "2026-07-14T12:00:00.000Z",
              },
              {
                id: 303,
                lotType: { name: "CAR" },
                lotStatus: "SOLD",
                title: "Sold without verified price",
                currentPrice: 190_000_000,
                currency: "UZS",
                endTime: "2026-07-13T12:00:00.000Z",
              },
            ],
          },
        }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows only verified sold outcomes with a final price", async () => {
    const page = await SoldArchivePage({
      searchParams: Promise.resolve({ lang: "en" }),
    });

    render(page);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("status=FINISHED&approvalStatus=APPROVED"),
      expect.any(Object),
    );

    expect(screen.getByText("Verified sold vehicle")).toBeVisible();
    const soldCard = screen.getByText("Verified sold vehicle").closest("article");
    expect(soldCard).not.toBeNull();
    expect(within(soldCard!).getByText(/250,000,000/)).toBeVisible();
    expect(within(soldCard!).queryByText(/240,000,000/)).not.toBeInTheDocument();
    expect(screen.queryByText("Generic ended vehicle")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Sold without verified price"),
    ).not.toBeInTheDocument();
    const fallback = within(soldCard!).getByRole("img", {
      name: "Vehicle image unavailable",
    });
    expect(fallback.innerHTML).toContain("brand.png");
    expect(fallback.innerHTML).not.toContain(
      "champagne-ledger-featured-suv.png",
    );
  });

  it("publishes localized sold-archive metadata", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ lang: "ru" }),
    });

    expect(metadata.title).toBe(
      "Архив проданных автомобилей | TezAuksion",
    );
    expect(metadata.alternates?.canonical).toBe("/sold?lang=ru");
    expect(metadata.openGraph).toMatchObject({
      locale: "ru_RU",
      url: "/sold?lang=ru",
    });
  });

  it("distinguishes a transport failure from a genuine empty archive", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const page = await SoldArchivePage({
      searchParams: Promise.resolve({ lang: "en" }),
    });
    render(page);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The sold vehicle archive could not be loaded.",
    );
    expect(screen.queryByText(/No completed vehicle auctions/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/sold?lang=en",
    );
  });

  it("shows the empty state only after a successful empty response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ data: { dtoList: [] } }),
      })),
    );

    const page = await SoldArchivePage({
      searchParams: Promise.resolve({ lang: "en" }),
    });
    render(page);

    expect(
      screen.getByText("No completed vehicle auctions are available yet."),
    ).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
