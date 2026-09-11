import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChampagneHome } from "@/components/marketing/ChampagneHome";
import { renderWithAppProviders } from "@/test/render";

const testState = vi.hoisted(() => ({
  finalPrice: null as number | null,
  isError: false,
  isLoading: false,
  like: vi.fn(),
  lotStatus: "ACTIVE",
  lots: null as Array<Record<string, unknown>> | null,
  auctionsRequest: null as Record<string, unknown> | null,
  push: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: testState.push }),
}));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => ({ isAuthenticated: false, user: null }),
}));

vi.mock("@/queries/auction-listings", () => ({
  useAuctions: (request: Record<string, unknown>) => {
    testState.auctionsRequest = request;
    return {
      data: testState.lots ?? [
        {
          id: 10245,
          status: testState.lotStatus,
          lotType: { name: "CAR" },
          title: "Chevrolet Tahoe 2023",
          startPrice: 745_000_000,
          currentPrice: 745_000_000,
          finalPrice: testState.finalPrice,
          currency: "UZS",
          endTime: "2026-07-16T18:00:00.000Z",
          vehicle: {
            vin: "TESTVIN1234567890",
            makeName: "Chevrolet",
            modelName: "Tahoe",
            year: 2023,
            mileage: 12450,
            fuelType: "petrol",
            transmission: "automatic",
            drivetrain: "4WD",
            region: "Toshkent",
            conditionGrade: "clean",
          },
          inspection: { status: "passed" },
          seller: { name: "Tez Motors", verified: true },
          images: [
            {
              url: "/vehicles/champagne-ledger-featured-suv.png",
              altText: "Navy Chevrolet Tahoe in a neutral studio",
            },
          ],
          capabilities: ["watchlist", "bidding", "live-updates"],
        },
      ],
      isError: testState.isError,
      isFetching: false,
      isLoading: testState.isLoading,
      refetch: testState.refetch,
    };
  },
}));

describe("ChampagneHome", () => {
  beforeEach(() => {
    testState.finalPrice = null;
    testState.isError = false;
    testState.isLoading = false;
    testState.like.mockClear();
    testState.lotStatus = "ACTIVE";
    testState.lots = null;
    testState.auctionsRequest = null;
    testState.push.mockClear();
    testState.refetch.mockClear();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("requests only admin-approved auctions for the public home page", () => {
    renderWithAppProviders(<ChampagneHome />);

    expect(testState.auctionsRequest).toMatchObject({
      approvalStatus: "APPROVED",
      page: 0,
      size: 20,
    });
  });

  it("matches the reference hierarchy and searches with shareable URL filters", async () => {
    const user = userEvent.setup();
    renderWithAppProviders(<ChampagneHome />);

    expect(
      screen.getByRole("heading", {
        name: /avtomobil auksionlarini toping va kuzating/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("img", { name: /navy premium suv/i }),
    ).toHaveAttribute(
      "src",
      expect.stringContaining("herosearch"),
    );

    await user.click(screen.getByLabelText(/^marka$/i));
    await user.click(screen.getByRole("option", { name: "Chevrolet" }));
    await user.click(screen.getByRole("button", { name: /^qidirish$/i }));

    expect(testState.push).toHaveBeenCalledWith(
      expect.stringContaining("/auctions?make=Chevrolet"),
    );
  });

  it("opens a live featured auction through the bidding route", async () => {
    const user = userEvent.setup();
    renderWithAppProviders(<ChampagneHome />);

    await user.click(
      screen.getByRole("button", { name: /auksionga kirish/i }),
    );

    expect(testState.push).toHaveBeenCalledWith("/auctions/10245/live");
  });

  it("does not promote a closed record as the live featured auction", () => {
    testState.lotStatus = "SOLD";
    testState.finalPrice = 705_000_000;

    renderWithAppProviders(<ChampagneHome />);

    expect(screen.getByText(/hozircha jonli auksion yo‘q/i)).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /auksionga kirish/i }),
    ).not.toBeInTheDocument();
  });

  it("offers a real retry when the homepage auction feed fails", async () => {
    const user = userEvent.setup();
    testState.isError = true;
    testState.lots = [];

    renderWithAppProviders(<ChampagneHome />, { locale: "en" });

    expect(screen.getByText("Auctions could not be loaded")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(testState.refetch).toHaveBeenCalledOnce();
  });

  it("warns and offers retry when cached live data could not be refreshed", async () => {
    const user = userEvent.setup();
    testState.isError = true;

    renderWithAppProviders(<ChampagneHome />, { locale: "en" });

    expect(
      screen.getByText(/displayed values may be out of date/i),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(testState.refetch).toHaveBeenCalledOnce();
  });

  it("shows ending-soon lots and verified finished prices from the normalized live feed", () => {
    testState.lots = [
      legacyVehicleLot("Featured live vehicle", 201, "ACTIVE"),
      legacyVehicleLot("Ending soon vehicle", 202, "ENDING_SOON", {
        endTime: "2026-07-16T12:00:00.000Z",
      }),
      legacyVehicleLot("Sold evidence vehicle", 203, "SOLD", {
        finalPrice: 705_000_000,
      }),
      legacyVehicleLot("Ended evidence vehicle", 204, "FINISHED", {
        finalPrice: 680_000_000,
      }),
      legacyVehicleLot("Closed without evidence", 205, "FINISHED", {
        finalPrice: null,
      }),
    ];

    renderWithAppProviders(<ChampagneHome />, { locale: "en" });

    expect(screen.getByRole("heading", { name: "Ending soon" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Ending soon vehicle" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Finished auction evidence" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Sold evidence vehicle" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Ended evidence vehicle" })).toBeVisible();
    expect(screen.getByText("UZS 705,000,000")).toBeVisible();
    expect(screen.getByText("UZS 680,000,000")).toBeVisible();
    expect(screen.queryByText("Closed without evidence")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start selling/i })).toHaveAttribute("href", "/sell");
  });

  it("hides absent marketplace evidence in production but keeps implemented guidance", () => {
    vi.stubEnv("NODE_ENV", "production");
    testState.lots = [
      legacyVehicleLot("Only live vehicle", 301, "ACTIVE"),
      legacyVehicleLot("Unverified closed vehicle", 302, "SOLD", {
        finalPrice: null,
      }),
    ];

    renderWithAppProviders(<ChampagneHome />, { locale: "en" });

    expect(screen.queryByRole("heading", { name: "Ending soon" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Finished auction evidence" })).not.toBeInTheDocument();
    expect(screen.queryByText("Unverified closed vehicle")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How it works" })).toBeVisible();
    expect(screen.getByRole("link", { name: /start selling/i })).toHaveAttribute("href", "/sell");
  });

  it("does not present development fixtures as API-backed finished-price evidence", () => {
    testState.lots = [];

    renderWithAppProviders(<ChampagneHome />, { locale: "en" });

    expect(screen.queryByRole("heading", { name: "Finished auction evidence" })).not.toBeInTheDocument();
    expect(screen.queryByText("2022 Chevrolet Tahoe LT")).not.toBeInTheDocument();
  });

  it("does not use empty-feed fixtures even when the old demo flag is enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_AUCTIONS", "true");
    testState.lots = [];

    renderWithAppProviders(<ChampagneHome />, { locale: "en" });

    expect(screen.queryByText(/demo data/i)).not.toBeInTheDocument();
    expect(screen.queryByText("2024 Chevrolet Tahoe High Country")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Finished auction evidence" }),
    ).not.toBeInTheDocument();
  });

  it("does not turn an uninspected API lot into assurance or delivery claims", () => {
    testState.lots = [legacyVehicleLot("Uninspected API vehicle", 401, "ACTIVE")];

    renderWithAppProviders(<ChampagneHome />, { locale: "en" });

    expect(screen.queryByText("Inspected")).not.toBeInTheDocument();
    expect(screen.queryByText("every vehicle")).not.toBeInTheDocument();
    expect(screen.queryByText(/nationwide delivery/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/professional help/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/trusted vehicle auctions/i)).not.toBeInTheDocument();
    expect(screen.getByText("Search listings")).toBeVisible();
    expect(screen.getByText("Listing details")).toBeVisible();
    expect(screen.getByText("Watchlist")).toBeVisible();
    expect(screen.getByText("Auction status")).toBeVisible();
  });
});

function legacyVehicleLot(
  title: string,
  id: number,
  lotStatus: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    attributes: {
      drivetrain: "4WD",
      fuel: "petrol",
      make: "Chevrolet",
      mileage: 12_450,
      model: "Tahoe",
      transmission: "automatic",
      year: 2023,
    },
    capabilities: ["watchlist", "bidding", "live-updates"],
    currency: "UZS",
    currentPrice: 700_000_000,
    endTime: "2026-07-16T18:00:00.000Z",
    id,
    lotStatus,
    lotType: { name: "CAR" },
    startPrice: 680_000_000,
    title,
    ...overrides,
  };
}
