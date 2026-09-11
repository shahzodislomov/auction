import { fireEvent, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuctionDiscovery } from "@/components/auction/AuctionDiscovery";
import { renderWithAppProviders } from "@/test/render";

const testState = vi.hoisted(() => ({
  data: {
    items: [
      {
        auctionId: 501,
        status: "LIVE",
        currentPrice: 320_000_000,
        startPrice: 300_000_000,
        currency: "UZS",
        startTime: "2026-07-18T08:00:00.000Z",
        vehicle: {
          make: "Chevrolet",
          model: "Cobalt",
          year: 2024,
          mileage: 1200,
          fuelType: "PETROL",
          region: "Toshkent",
          images: [{ imageUrl: "/vehicles/champagne-ledger-featured-suv.png" }],
        },
      },
      {
        auctionId: 502,
        status: "FINISHED",
        finalPrice: 280_000_000,
        currency: "UZS",
        startTime: "2026-07-16T08:00:00.000Z",
        vehicle: {
          make: "BYD",
          model: "Song Plus",
          year: 2023,
          mileage: 2500,
          fuelType: "HYBRID",
          region: "Samarqand",
          images: [{ imageUrl: "/vehicles/champagne-ledger-hero-suv.png" }],
        },
      },
    ],
    meta: { elements: 58, pages: 6 },
  },
  isError: false,
  isLoading: false,
  feedRequest: null as null | Record<string, unknown>,
  push: vi.fn(),
  search: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: testState.push }),
  useSearchParams: () => testState.search,
}));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => ({ isAuthenticated: false, user: null }),
}));

vi.mock("@/queries/auction-listings", () => ({
  useAuctionFeed: (request: Record<string, unknown>) => {
    testState.feedRequest = request;
    return {
    data: testState.data,
    isError: testState.isError,
    isLoading: testState.isLoading,
  };
  },
}));

describe("AuctionDiscovery", () => {
  beforeEach(() => {
    testState.data = {
      items: [
        {
          auctionId: 501,
          status: "LIVE",
          currentPrice: 320_000_000,
          startPrice: 300_000_000,
          currency: "UZS",
          startTime: "2026-07-18T08:00:00.000Z",
          vehicle: {
            make: "Chevrolet",
            model: "Cobalt",
            year: 2024,
            mileage: 1200,
            fuelType: "PETROL",
            region: "Toshkent",
            images: [{ imageUrl: "/vehicles/champagne-ledger-featured-suv.png" }],
          },
        },
        {
          auctionId: 502,
          status: "FINISHED",
          finalPrice: 280_000_000,
          currency: "UZS",
          startTime: "2026-07-16T08:00:00.000Z",
          vehicle: {
            make: "BYD",
            model: "Song Plus",
            year: 2023,
            mileage: 2500,
            fuelType: "HYBRID",
            region: "Samarqand",
            images: [{ imageUrl: "/vehicles/champagne-ledger-hero-suv.png" }],
          },
        },
      ],
      meta: { elements: 58, pages: 6 },
    };
    testState.isError = false;
    testState.isLoading = false;
    testState.feedRequest = null;
    testState.push.mockClear();
    testState.search = new URLSearchParams();
  });

  it("renders backend result counts and pager controls", () => {
    renderWithAppProviders(<AuctionDiscovery />);

    expect(screen.getByText("58 ta avtomobil")).toBeVisible();
    expect(screen.getByText("Sahifa 1 / 6")).toBeVisible();
    expect(screen.getByRole("button", { name: "Oldingi sahifa" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Keyingi sahifa" })).toBeEnabled();
  });

  it("requests only admin-approved auctions for the public auction page", () => {
    renderWithAppProviders(<AuctionDiscovery />);

    expect(testState.feedRequest).toMatchObject({ approvalStatus: "APPROVED", status: "CURRENT" });
  });

  it("defaults to CURRENT (Joriy) status and pushes changes into the URL", async () => {
    renderWithAppProviders(<AuctionDiscovery />);

    const statusSelect = screen.getByRole("combobox", { name: /auksion holati/i }) as HTMLSelectElement;
    expect(statusSelect.value).toBe("CURRENT");

    fireEvent.change(statusSelect, {
      target: { value: "ENDED" },
    });

    expect(testState.push).toHaveBeenCalledWith("/auctions?status=ENDED");
  });

  it("passes URL search text to the backend auction query with 1-based URL page mapped to 0-indexed backend page", () => {
    testState.search = new URLSearchParams("search=cobalt&page=2");

    renderWithAppProviders(<AuctionDiscovery />);

    expect(screen.getByText("Sahifa 2 / 6")).toBeVisible();
    expect(testState.feedRequest).toMatchObject({
      approvalStatus: "APPROVED",
      page: 1,
      search: "cobalt",
      size: 10,
    });
  });

  it("navigates with 1-based page in URL when next page button is clicked", () => {
    renderWithAppProviders(<AuctionDiscovery />);

    fireEvent.click(screen.getByRole("button", { name: "Keyingi sahifa" }));

    expect(testState.push).toHaveBeenCalledWith("/auctions?page=2");
  });

  it("stores the selected page size in the URL and resets to the first page", () => {
    testState.search = new URLSearchParams("page=3&search=cobalt");
    renderWithAppProviders(<AuctionDiscovery />);

    fireEvent.change(screen.getByRole("combobox", { name: "Sahifadagi yozuvlar soni" }), {
      target: { value: "50" },
    });

    expect(testState.push).toHaveBeenLastCalledWith("/auctions?size=50&search=cobalt");
  });

  it("pushes search text into the URL instead of filtering the current page", async () => {
    renderWithAppProviders(<AuctionDiscovery />);

    fireEvent.change(screen.getByRole("searchbox", { name: /qidirish/i }), {
      target: { value: "cobalt" },
    });

    expect(testState.push).toHaveBeenLastCalledWith("/auctions?search=cobalt");
  });

  it("shows backend loading only in the cards area", () => {
    testState.isLoading = true;
    renderWithAppProviders(<AuctionDiscovery />);

    expect(screen.getByText("58 ta avtomobil")).toBeVisible();
    expect(screen.getByLabelText("Auksionlar yuklanmoqda")).toBeVisible();
  });

  it("provides exactly 14 official regions with distinct Toshkent shahri and Toshkent viloyati", () => {
    testState.data.items.push({
      auctionId: 503,
      status: "LIVE",
      currentPrice: 100_000_000,
      startPrice: 90_000_000,
      currency: "UZS",
      startTime: "2026-07-18T08:00:00.000Z",
      vehicle: {
        make: "Chevrolet",
        model: "Damas",
        year: 2022,
        mileage: 50000,
        fuelType: "PETROL",
        region: "string",
        images: [],
      },
    });

    renderWithAppProviders(<AuctionDiscovery />);

    const regionSelect = screen.getByRole("combobox", { name: "Hudud" });
    const options = Array.from(regionSelect.querySelectorAll("option")).map(
      (opt) => opt.textContent,
    );

    expect(options).toContain("Toshkent shahri");
    expect(options).toContain("Toshkent viloyati");
    expect(options).toContain("Andijon viloyati");
    expect(options).not.toContain("string");
    expect(options).not.toContain("Андижанская область");

    // All options: 1 placeholder + 1 clear option + 14 official regions = 16 total
    expect(options).toHaveLength(16);
  });

  it("provides year filter options from 2026 down to 1980 without out-of-range years", () => {
    renderWithAppProviders(<AuctionDiscovery />);

    const yearSelect = screen.getByRole("combobox", { name: "Yil" });
    const options = Array.from(yearSelect.querySelectorAll("option")).map((o) => o.value);

    expect(options).toContain("2026");
    expect(options).toContain("1980");
    expect(options).not.toContain("2027");
    expect(options).not.toContain("1979");
    const nonPlaceholderYears = options.filter(Boolean);
    expect(nonPlaceholderYears[0]).toBe("2026");
    expect(nonPlaceholderYears[nonPlaceholderYears.length - 1]).toBe("1980");
    expect(nonPlaceholderYears.length).toBe(47);
  });

  it("updates URL when year filter is changed", () => {
    renderWithAppProviders(<AuctionDiscovery />);

    fireEvent.change(screen.getByRole("combobox", { name: "Yil" }), {
      target: { value: "2024" },
    });

    expect(testState.push).toHaveBeenCalledWith("/auctions?year=2024");
  });
});
