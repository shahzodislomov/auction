import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LiveAuctionRoom } from "@/components/auction/LiveAuctionRoom";
import { renderWithAppProviders } from "@/test/render";

const testState = vi.hoisted(() => ({
  lotData: null as Record<string, unknown> | null,
  lotError: false,
  lotLoading: false,
  lotRefetch: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: { post: vi.fn() },
}));

vi.mock("@/queries/auction-listings", () => ({
  useAuction: () => ({
    data: testState.lotData,
    isError: testState.lotError,
    isLoading: testState.lotLoading,
    refetch: testState.lotRefetch,
  }),
}));

vi.mock("@/queries/lots", () => ({
  useLot: () => ({
    data: testState.lotData,
    isError: testState.lotError,
    isLoading: testState.lotLoading,
    refetch: testState.lotRefetch,
  }),
  useLotCounts: () => ({ data: null, refetch: vi.fn() }),
}));

vi.mock("@/queries/bid", () => ({
  useHighestBid: () => ({ data: null, isError: false, refetch: vi.fn() }),
  useBidsByLot: () => ({ data: [], isError: false, refetch: vi.fn() }),
}));

vi.mock("@/queries/users", () => ({
  useUserDeposits: () => ({ data: [], isError: false, refetch: vi.fn() }),
}));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => ({ isAuthenticated: false, user: null }),
}));

vi.mock("@/hooks/useStomp", () => ({
  useSocket: () => ({
    connected: false,
    connectionState: "polling",
    publish: vi.fn(),
    subscribe: vi.fn(),
  }),
}));

describe("LiveAuctionRoom lot recovery states", () => {
  beforeEach(() => {
    testState.lotData = null;
    testState.lotError = false;
    testState.lotLoading = false;
    testState.lotRefetch.mockClear();
  });

  it("shows a loading state without claiming the lot is missing", () => {
    testState.lotLoading = true;

    renderWithAppProviders(
      <LiveAuctionRoom auctionId="live-recovery-lot" />,
      { locale: "en" },
    );

    expect(
      screen.getByRole("heading", { name: "Retrieving the current lot details." }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Vehicle auction not found" }),
    ).not.toBeInTheDocument();
  });

  it("shows a transport error with retry without claiming the lot is missing", async () => {
    testState.lotError = true;
    const user = userEvent.setup();

    renderWithAppProviders(
      <LiveAuctionRoom auctionId="live-recovery-lot" />,
      { locale: "en" },
    );

    expect(
      screen.getByRole("heading", { name: "Live auction could not be loaded" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Vehicle auction not found" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(testState.lotRefetch).toHaveBeenCalled();
  });

  it("keeps a genuine empty response as not found", () => {
    renderWithAppProviders(
      <LiveAuctionRoom auctionId="live-recovery-lot" />,
      { locale: "en" },
    );

    expect(
      screen.getByRole("heading", { name: "Vehicle auction not found" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Back to lot details" })).toHaveAttribute(
      "href",
      "/auctions",
    );
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });
});
