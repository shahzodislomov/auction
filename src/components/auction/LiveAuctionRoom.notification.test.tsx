import { act } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LiveAuctionRoom } from "@/components/auction/LiveAuctionRoom";
import type { VehicleAuction } from "@/lib/auction/types";
import { renderWithAppProviders } from "@/test/render";

const notificationState = vi.hoisted(() => ({
  bids: [] as unknown[],
  deposits: [] as unknown[],
  highestBid: null as unknown,
  notification: vi.fn(),
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
    data: notificationState.highestBid,
    isError: false,
    refetch: vi.fn(),
  }),
  useBidsByLot: () => ({
    data: notificationState.bids,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/queries/users", () => ({
  useUserDeposits: () => ({
    data: notificationState.deposits,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => ({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    user: null,
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

function upcomingAuction(startOffsetMs: number): VehicleAuction {
  const now = Date.now();
  return {
    id: "live-start-88",
    vehicleId: "vehicle-88",
    lotNumber: "88",
    vin: "1HGCM82633A004352",
    status: "upcoming",
    title: {
      default: "Chevrolet Malibu",
      uz: "Chevrolet Malibu",
      ru: "Chevrolet Malibu",
      en: "Chevrolet Malibu",
    },
    description: {
      default: "Auction test vehicle",
      uz: "Auction test vehicle",
      ru: "Auction test vehicle",
      en: "Auction test vehicle",
    },
    make: "Chevrolet",
    model: "Malibu",
    year: 2024,
    startPrice: 200000000,
    currentPrice: 200000000,
    finalPrice: null,
    currency: "UZS",
    incrementType: "FIXED",
    incrementValue: 1000000,
    startTime: new Date(now + startOffsetMs).toISOString(),
    endTime: new Date(now + 60_000).toISOString(),
    publishedAt: new Date(now - 60_000).toISOString(),
    mileage: 10000,
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

describe("LiveAuctionRoom start notifications", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    notificationState.notification.mockReset();

    class NotificationMock {
      static permission: NotificationPermission = "granted";

      constructor(title: string, options?: NotificationOptions) {
        notificationState.notification(title, options);
      }
    }

    vi.stubGlobal(
      "Notification",
      NotificationMock,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows a browser notification once when the waiting auction starts", () => {
    renderWithAppProviders(
      <LiveAuctionRoom
        auctionId="live-start-88"
        connectionStateOverride="polling"
        initialAuction={upcomingAuction(1000)}
      />,
      { locale: "en" },
    );

    expect(notificationState.notification).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(notificationState.notification).toHaveBeenCalledTimes(1);
    expect(notificationState.notification).toHaveBeenCalledWith(
      "Auction started · #88",
      expect.objectContaining({
        body: "Chevrolet Malibu",
        tag: "auction-start-live-start-88",
      }),
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(notificationState.notification).toHaveBeenCalledTimes(1);
  });
});
