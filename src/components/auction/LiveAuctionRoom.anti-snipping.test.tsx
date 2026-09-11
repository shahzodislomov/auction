import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LiveAuctionRoom } from "@/components/auction/LiveAuctionRoom";
import type { AuctionBidEntry } from "@/components/auction/BidLedger";
import type { VehicleAuction } from "@/lib/auction/types";
import { renderWithAppProviders } from "@/test/render";

const testState = vi.hoisted(() => ({
  bids: [] as AuctionBidEntry[],
  deposits: [{ id: 1, auctionId: "anti-snip-100", lotId: "anti-snip-100" }] as unknown[],
  highestBid: null as AuctionBidEntry | null,
}));

vi.mock("@/api/api", () => ({
  api: { post: vi.fn().mockResolvedValue({ data: { status: "OK", id: "bid-999" } }) },
}));

vi.mock("@/queries/auction-listings", () => ({
  useAuction: () => ({
    data: undefined,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/queries/bid", () => ({
  useHighestBid: () => ({
    data: testState.highestBid,
    isError: false,
    refetch: vi.fn(),
  }),
  useBidsByLot: () => ({
    data: testState.bids,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/queries/users", () => ({
  useUserDeposits: () => ({
    data: testState.deposits,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => ({
    isAuthenticated: true,
    isLoading: false,
    error: null,
    user: { id: 55, firstname: "Bidder" },
  }),
}));

vi.mock("@/hooks/useStomp", () => ({
  useSocket: () => ({
    connected: false,
    connectionState: "polling",
    publish: vi.fn(),
    subscribe: vi.fn(),
  }),
}));

function createAuction(remainingMs: number): VehicleAuction {
  const now = Date.now();
  return {
    id: "anti-snip-100",
    vehicleId: "vehicle-100",
    lotNumber: "100",
    vin: "1HGCM82633A004352",
    status: "live",
    title: {
      default: "Tracker LT",
      uz: "Tracker LT",
      ru: "Tracker LT",
      en: "Tracker LT",
    },
    description: {
      default: "Anti-snip test",
      uz: "Anti-snip test",
      ru: "Anti-snip test",
      en: "Anti-snip test",
    },
    make: "Chevrolet",
    model: "Tracker",
    year: 2024,
    startPrice: 200000000,
    currentPrice: 200000000,
    finalPrice: null,
    currency: "UZS",
    incrementType: "FIXED",
    incrementValue: 1000000,
    startTime: new Date(now - 60_000).toISOString(),
    endTime: new Date(now + remainingMs).toISOString(),
    publishedAt: new Date(now - 120_000).toISOString(),
    mileage: 5000,
    fuel: "PETROL",
    transmission: "AUTOMATIC",
    drivetrain: "FWD",
    region: null,
    condition: "GOOD",
    damage: null,
    seller: null,
    inspection: null,
    documents: [],
    images: [],
    counts: {
      views: 0,
      bids: 0,
      watchers: 0,
      participants: 0,
    },
    capabilities: [],
  };
}

describe("LiveAuctionRoom anti-snipping behavior", () => {
  beforeEach(() => {
    testState.bids = [];
    testState.highestBid = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("extends auction by +5 minutes when a bid is placed within the final 2 minutes", async () => {
    // 90 seconds remaining (within 2-minute window)
    const auction = createAuction(90 * 1000);
    const user = userEvent.setup();

    renderWithAppProviders(
      <LiveAuctionRoom
        auctionId="anti-snip-100"
        initialAuction={auction}
        canBidOverride
      />,
      { locale: "uz" },
    );

    const placeBidButton = screen.getByRole("button", { name: "Taklif berish" });
    await user.click(placeBidButton);

    const confirmButton = await screen.findByRole("button", {
      name: "Taklifni tasdiqlash",
    });
    await user.click(confirmButton);

    // Anti-snipping banner is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Anti-snipping: auksion tugashiga 2 daqiqadan kam qolganda yangi taklif berildi/i),
      ).toBeInTheDocument();
    });
  });

  it("does not trigger anti-snipping when a bid is placed with more than 2 minutes remaining", async () => {
    // 10 minutes remaining (outside 2-minute window)
    const auction = createAuction(10 * 60 * 1000);
    const user = userEvent.setup();

    renderWithAppProviders(
      <LiveAuctionRoom
        auctionId="anti-snip-100"
        initialAuction={auction}
        canBidOverride
      />,
      { locale: "uz" },
    );

    const placeBidButton = screen.getByRole("button", { name: "Taklif berish" });
    await user.click(placeBidButton);

    const confirmButton = await screen.findByRole("button", {
      name: "Taklifni tasdiqlash",
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText(/Anti-snipping/i)).not.toBeInTheDocument();
    });
  });

  it("shows cutoff notice when user has no deposit and remaining time is <= 5 minutes", async () => {
    testState.deposits = [];
    const auction = createAuction(4 * 60 * 1000); // 4 minutes remaining

    renderWithAppProviders(
      <LiveAuctionRoom
        auctionId="anti-snip-100"
        initialAuction={auction}
      />,
      { locale: "uz" },
    );

    expect(
      screen.getByText(/Auksion tugashiga 5 daqiqadan kam vaqt qolganda kafolat puli to‘lash va ishtirok etish mumkin emas/i),
    ).toBeInTheDocument();
  });

  it("guides user to lot card to pay deposit when remaining time is > 5 minutes in a live auction", async () => {
    testState.deposits = [];
    const auction = createAuction(10 * 60 * 1000); // 10 minutes remaining

    renderWithAppProviders(
      <LiveAuctionRoom
        auctionId="anti-snip-100"
        initialAuction={auction}
      />,
      { locale: "uz" },
    );

    expect(
      screen.getByText(/Taklif berishdan oldin lot kartasida 1% kafolat pulini kiriting/i),
    ).toBeInTheDocument();
  });
});
