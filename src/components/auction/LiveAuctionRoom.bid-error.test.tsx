import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LiveAuctionRoom } from "@/components/auction/LiveAuctionRoom";
import type { AuctionBidEntry } from "@/components/auction/BidLedger";
import type { VehicleAuction } from "@/lib/auction/types";
import { renderWithAppProviders } from "@/test/render";

const bidErrorState = vi.hoisted(() => ({
  bids: [] as AuctionBidEntry[],
  deposits: [] as unknown[],
  highestBid: null as AuctionBidEntry | null,
}));

vi.mock("@/api/api", () => ({
  api: { post: vi.fn() },
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
    data: bidErrorState.highestBid,
    isError: false,
    refetch: vi.fn(),
  }),
  useBidsByLot: () => ({
    data: bidErrorState.bids,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/queries/users", () => ({
  useUserDeposits: () => ({
    data: bidErrorState.deposits,
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

function liveAuction(): VehicleAuction {
  const now = Date.now();
  return {
    id: "bid-error-55",
    vehicleId: "vehicle-55",
    lotNumber: "55",
    vin: "1HGCM82633A004352",
    status: "live",
    title: {
      default: "Tracker LT",
      uz: "Tracker LT",
      ru: "Tracker LT",
      en: "Tracker LT",
    },
    description: {
      default: "Live bid test",
      uz: "Live bid test",
      ru: "Live bid test",
      en: "Live bid test",
    },
    make: "Chevrolet",
    model: "Tracker",
    year: 2024,
    startPrice: 200000000,
    currentPrice: 220000000,
    finalPrice: null,
    currency: "UZS",
    incrementType: "FIXED",
    incrementValue: 1000000,
    startTime: new Date(now - 60_000).toISOString(),
    endTime: new Date(now + 60 * 60 * 1000).toISOString(),
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

describe("LiveAuctionRoom bid rejection messaging", () => {
  beforeEach(() => {
    bidErrorState.highestBid = {
      id: "top-bid",
      amount: 220000000,
      bidderId: "77",
      bidderLabel: "Bidder ••77",
      timestamp: new Date().toISOString(),
    };
    bidErrorState.bids = [bidErrorState.highestBid];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("uses the auction start price for the first bid", async () => {
    const user = userEvent.setup();
    const onPlaceBid = vi.fn();
    bidErrorState.highestBid = null;
    bidErrorState.bids = [];

    renderWithAppProviders(
      <LiveAuctionRoom
        auctionId="bid-error-55"
        canBidOverride
        bidderStateOverride="watching"
        connectionStateOverride="polling"
        initialAuction={{ ...liveAuction(), currentPrice: 200000000 }}
        initialHighestBid={null}
        initialBids={[]}
        onPlaceBidOverride={onPlaceBid}
      />,
      { locale: "uz" },
    );

    expect(screen.getByLabelText("Taklifingiz")).toHaveValue(200000000);

    await user.click(screen.getByRole("button", { name: "Taklif berish" }));
    await user.click(screen.getByRole("button", { name: "Taklifni tasdiqlash" }));

    await waitFor(() => {
      expect(onPlaceBid).toHaveBeenCalledWith(200000000);
    });
  });

  it("translates the backend own-bid lock error into a clear user message", async () => {
    const user = userEvent.setup();

    renderWithAppProviders(
      <LiveAuctionRoom
        auctionId="bid-error-55"
        canBidOverride
        bidderStateOverride="watching"
        connectionStateOverride="polling"
        initialAuction={liveAuction()}
        initialHighestBid={bidErrorState.highestBid}
        initialBids={bidErrorState.bids}
        onPlaceBidOverride={() => {
          throw new Error("Invalid Bid, second BID in a row is not allowed!");
        }}
      />,
      { locale: "uz" },
    );

    await user.clear(screen.getByLabelText("Taklifingiz"));
    await user.type(screen.getByLabelText("Taklifingiz"), "221000000");
    await user.click(screen.getByRole("button", { name: "Taklif berish" }));
    await user.click(screen.getByRole("button", { name: "Taklifni tasdiqlash" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Siz ketma-ket ikki marta taklif bera olmaysiz. Yana taklif berish uchun avval boshqa foydalanuvchi taklif kiritishi kerak.",
        ),
      ).toBeVisible();
    });

    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("shows the translated own-bid lock message inside the confirmation modal for axios-style errors", async () => {
    const user = userEvent.setup();

    renderWithAppProviders(
      <LiveAuctionRoom
        auctionId="bid-error-55"
        canBidOverride
        bidderStateOverride="watching"
        connectionStateOverride="polling"
        initialAuction={liveAuction()}
        initialHighestBid={bidErrorState.highestBid}
        initialBids={bidErrorState.bids}
        onPlaceBidOverride={() => {
          throw {
            response: {
              data: {
                message: "Invalid Bid, second BID in a row is not allowed!",
                status: "BAD_REQUEST",
              },
            },
          };
        }}
      />,
      { locale: "uz" },
    );

    await user.clear(screen.getByLabelText("Taklifingiz"));
    await user.type(screen.getByLabelText("Taklifingiz"), "221000000");
    await user.click(screen.getByRole("button", { name: "Taklif berish" }));
    await user.click(screen.getByRole("button", { name: "Taklifni tasdiqlash" }));

    await waitFor(() => {
      expect(
        screen.getByRole("dialog"),
      ).toContainElement(
        screen.getByText(
          "Siz ketma-ket ikki marta taklif bera olmaysiz. Yana taklif berish uchun avval boshqa foydalanuvchi taklif kiritishi kerak.",
        ),
      );
    });
  });
});
