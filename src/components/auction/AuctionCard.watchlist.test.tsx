import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuctionCard } from "@/components/auction/AuctionCard";
import { demoVehicleAuctions } from "@/lib/fixtures/vehicleAuctions";
import { renderWithAppProviders } from "@/test/render";

const testState = vi.hoisted(() => ({
  authenticated: true,
  contextUserId: 7 as string | number | null,
  likedLots: [] as Array<{ id: string | number }>,
  likedQueryUserId: vi.fn(),
  like: vi.fn(),
  likeError: undefined as ((error: unknown) => void) | undefined,
  likeRequests: [] as Array<{
    onError?: (error: unknown) => void;
    onSuccess?: (data: unknown) => void;
  }>,
  likeSuccess: undefined as ((data: unknown) => void) | undefined,
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: testState.push }),
}));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => ({
    isAuthenticated: testState.authenticated,
    user: testState.authenticated ? { id: testState.contextUserId } : null,
  }),
}));

vi.mock("@/queries/lots", () => ({
  useLikedLots: (userId: number) => {
    testState.likedQueryUserId(userId);
    return { data: testState.likedLots };
  },
  useLikeLotMutation: (
    onSuccess?: (data: unknown) => void,
    onError?: (error: unknown) => void,
  ) => {
    testState.likeSuccess = onSuccess;
    testState.likeError = onError;
    return {
      isPending: false,
      mutate: (
        variables: unknown,
        options?: {
          onError?: (error: unknown) => void;
          onSuccess?: (data: unknown) => void;
        },
      ) => {
        testState.like(variables);
        testState.likeRequests.push(options ?? {});
      },
    };
  },
}));

function completeLike(data: unknown, requestIndex = testState.likeRequests.length - 1) {
  testState.likeSuccess?.(data);
  testState.likeRequests[requestIndex]?.onSuccess?.(data);
}

describe("AuctionCard watchlist", () => {
  beforeEach(() => {
    testState.authenticated = true;
    testState.contextUserId = 7;
    testState.likedLots = [];
    testState.likedQueryUserId.mockClear();
    testState.like.mockClear();
    testState.likeError = undefined;
    testState.likeRequests.length = 0;
    testState.likeSuccess = undefined;
    testState.push.mockClear();
    window.localStorage.clear();
    window.localStorage.setItem("userId", "7");
  });

  it("starts saved from the liked-lots response and honors an unlike response", async () => {
    const user = userEvent.setup();
    const auction = demoVehicleAuctions[0];
    testState.likedLots = [{ id: Number(auction.id) }];
    renderWithAppProviders(<AuctionCard auction={auction} />, { locale: "en" });

    const saveButton = screen.getByRole("button", { name: "Saved" });
    expect(saveButton).toHaveAttribute("aria-pressed", "true");

    await user.click(saveButton);
    expect(testState.like).toHaveBeenCalledWith(
      expect.objectContaining({
        lotId: auction.id,
        userId: "7",
        isLiked: true,
      }),
    );

    act(() => completeLike({ message: "Unliked successfully" }));

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Removed from your watchlist.",
    );
  });

  it("honors a liked response for a previously unsaved lot", async () => {
    const user = userEvent.setup();
    const auction = demoVehicleAuctions[0];
    renderWithAppProviders(<AuctionCard auction={auction} />, { locale: "en" });

    await user.click(screen.getByRole("button", { name: "Save" }));
    act(() => completeLike({ liked: true }));

    expect(screen.getByRole("button", { name: "Saved" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Saved to your watchlist.",
    );
  });

  it("keeps the known state and reports an unrecognized server response", async () => {
    const user = userEvent.setup();
    const auction = demoVehicleAuctions[0];
    renderWithAppProviders(<AuctionCard auction={auction} />, { locale: "en" });

    await user.click(screen.getByRole("button", { name: "Save" }));
    act(() => completeLike({ status: "OK" }));

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "The server did not confirm the watchlist state.",
    );
  });

  it("never treats an explicit ERROR response as a saved state", async () => {
    const user = userEvent.setup();
    const auction = demoVehicleAuctions[0];
    renderWithAppProviders(<AuctionCard auction={auction} />, { locale: "en" });

    await user.click(screen.getByRole("button", { name: "Save" }));
    act(() => completeLike({ liked: true, message: "Liked successfully", status: "ERROR" }));

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "The server did not confirm the watchlist state.",
    );
  });

  it("prefers the context identity and clears a saved override across lot scopes", async () => {
    const user = userEvent.setup();
    const firstAuction = demoVehicleAuctions[0];
    const secondAuction = demoVehicleAuctions[1];
    testState.contextUserId = 19;
    window.localStorage.setItem("userId", "7");
    const view = renderWithAppProviders(
      <AuctionCard auction={firstAuction} />,
      { locale: "en" },
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(testState.like).toHaveBeenCalledWith(
      expect.objectContaining({
        lotId: firstAuction.id,
        userId: "19",
        isLiked: false,
      }),
    );
    expect(testState.likedQueryUserId).toHaveBeenLastCalledWith("19");
    act(() => completeLike({ liked: true }));
    expect(screen.getByRole("button", { name: "Saved" })).toBeVisible();

    view.rerender(<AuctionCard auction={secondAuction} />);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    view.rerender(<AuctionCard auction={firstAuction} />);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("does not apply an in-flight response to a replacement account", async () => {
    const user = userEvent.setup();
    const auction = demoVehicleAuctions[0];
    testState.contextUserId = 19;
    const view = renderWithAppProviders(<AuctionCard auction={auction} />, {
      locale: "en",
    });

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(testState.likeRequests).toHaveLength(1);

    testState.contextUserId = 23;
    view.rerender(<AuctionCard auction={auction} />);
    act(() => completeLike({ liked: true }, 0));

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("AuctionCard closed results", () => {
  beforeEach(() => {
    testState.authenticated = false;
    testState.contextUserId = null;
    testState.likedLots = [];
    window.localStorage.clear();
  });

  it("treats an ended auction with a final price as a closed result", () => {
    renderWithAppProviders(
      <AuctionCard
        auction={{
          ...demoVehicleAuctions[0],
          status: "ended",
          currentPrice: 876,
          endTime: "2026-07-15T15:00:00.000Z",
          finalPrice: 987,
        }}
      />,
      { locale: "en" },
    );

    expect(screen.getByText("Final price")).toBeVisible();
    expect(screen.getByText("UZS 987")).toBeVisible();
    expect(screen.getByText("Inspection passed")).toBeVisible();
    expect(screen.getByText(/Jul 15, 2026/).closest("dd")).toHaveTextContent(
      "Auction ended Jul 15, 2026",
    );
    expect(screen.getByRole("link", { name: "View result" })).toHaveAttribute(
      "href",
      "/auctions/10245",
    );
  });

  it("does not claim a final price for an ended auction without one", () => {
    renderWithAppProviders(
      <AuctionCard
        auction={{
          ...demoVehicleAuctions[0],
          status: "ended",
          currentPrice: 876,
          finalPrice: null,
        }}
      />,
      { locale: "en" },
    );

    expect(screen.queryByText("Final price")).not.toBeInTheDocument();
    expect(screen.getByText("Current price")).toBeVisible();
    expect(screen.getByText("UZS 876")).toBeVisible();
    expect(screen.getByRole("link", { name: "View result" })).toBeVisible();
  });

  it("hides inspection and end-date facts when the API did not supply them", () => {
    renderWithAppProviders(
      <AuctionCard
        auction={{
          ...demoVehicleAuctions[0],
          status: "ended",
          endTime: null,
          inspection: null,
        }}
      />,
      { locale: "en" },
    );

    expect(screen.queryByText(/Inspection (passed|pending|failed|needs)/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Auction ended/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sold on/)).not.toBeInTheDocument();
  });

  it("renders countdown to start for upcoming auctions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-08T10:00:00.000Z"));

    const upcomingAuction = {
      ...demoVehicleAuctions[0],
      status: "upcoming" as const,
      startTime: "2026-09-08T12:30:00.000Z",
    };

    renderWithAppProviders(<AuctionCard auction={upcomingAuction} />, {
      locale: "uz",
    });

    expect(screen.getByText("Auksion boshlanishiga")).toBeVisible();
    expect(screen.getAllByText(/02:30:00/).length).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getAllByText(/02:29:59/).length).toBeGreaterThan(0);

    vi.useRealTimers();
  });

  it("renders start time 19:19 and countdown for upcoming auction without timezone offset", () => {
    vi.useFakeTimers();
    // 17:00 Tashkent time = 12:00 UTC
    vi.setSystemTime(new Date("2026-09-07T12:00:00.000Z"));

    const upcomingAuction = {
      ...demoVehicleAuctions[0],
      status: "upcoming" as const,
      startTime: "2026-09-07T19:19:00",
      endTime: "2026-09-09T20:00:00",
    };

    renderWithAppProviders(<AuctionCard auction={upcomingAuction} />, {
      locale: "uz",
    });

    // Confirms start time label and formatted 19:19 in Tashkent time
    expect(screen.getByText("Auksion boshlanishiga")).toBeVisible();
    expect(screen.getByText(/19:19/)).toBeVisible();

    // 19:19 - 17:00 = 2 hours 19 minutes
    expect(screen.getAllByText(/02:19:00/).length).toBeGreaterThan(0);

    // Confirms ending time is not shown for upcoming auction
    expect(screen.queryByText(/20:00/)).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
