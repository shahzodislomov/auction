import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuctionDetail } from "@/components/auction/AuctionDetail";
import { demoVehicleAuctions } from "@/lib/fixtures/vehicleAuctions";
import { renderWithAppProviders } from "@/test/render";

const testState = vi.hoisted(() => ({
  comments: [] as unknown[] | undefined,
  commentsError: false,
  commentsLoading: false,
  commentsRefetch: vi.fn(),
  lotData: null as Record<string, unknown> | null,
  lotError: false,
  lotLoading: false,
  lotRefetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/api/api", () => ({
  api: { post: vi.fn(() => Promise.resolve({ data: {} })) },
}));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => ({ isAuthenticated: false, user: null }),
}));

vi.mock("@/hooks/useStomp", () => ({
  useSocket: () => null,
}));

vi.mock("@/components/auction/AuctionGallery", () => ({
  AuctionGallery: () => <div data-testid="auction-gallery" />,
}));

vi.mock("@/components/auction/AuctionFacts", () => ({
  AuctionFacts: () => <div data-testid="auction-facts" />,
}));

vi.mock("@/queries/auction-listings", () => ({
  useAuction: () => ({
    data: testState.lotData,
    isError: testState.lotError,
    isLoading: testState.lotLoading,
    refetch: testState.lotRefetch,
  }),
  useAuctions: () => ({
    data: [],
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/queries/lots", () => ({
  useLikeLotMutation: () => ({ isPending: false, mutate: vi.fn() }),
  useLikedLots: () => ({ data: [], refetch: vi.fn() }),
  useLot: () => ({
    data: testState.lotData,
    isError: testState.lotError,
    isLoading: testState.lotLoading,
    refetch: testState.lotRefetch,
  }),
  useLotCounts: () => ({ data: null, refetch: vi.fn() }),
  useRecLots: () => ({
    data: [],
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/queries/comments", () => ({
  useAllCommentsByVehicle: () => ({
    data: testState.comments,
    isError: testState.commentsError,
    isLoading: testState.commentsLoading,
    refetch: testState.commentsRefetch,
  }),
  useCreateComment: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock("@/queries/users", () => ({
  useUserDeposits: () => ({ data: [], refetch: vi.fn() }),
}));

vi.mock("@/queries/deposit", () => ({
  useDepositToLotMutation: () => ({ isPending: false, mutate: vi.fn() }),
  useDepositToAuctionMutation: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe("AuctionDetail recovery states", () => {
  beforeEach(() => {
    testState.comments = [];
    testState.commentsError = false;
    testState.commentsLoading = false;
    testState.commentsRefetch.mockClear();
    testState.lotData = null;
    testState.lotError = false;
    testState.lotLoading = false;
    testState.lotRefetch.mockClear();
    window.localStorage.clear();
  });

  it("shows lot loading without claiming the auction is missing", () => {
    testState.lotLoading = true;

    renderWithAppProviders(<AuctionDetail auctionId="detail-recovery-lot" />, {
      locale: "en",
    });

    expect(
      screen.getByRole("status", { name: "Loading vehicle lot" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Vehicle auction not found" }),
    ).not.toBeInTheDocument();
  });

  it("shows a lot transport error with retry without claiming not found", async () => {
    testState.lotError = true;
    const user = userEvent.setup();

    renderWithAppProviders(<AuctionDetail auctionId="detail-recovery-lot" />, {
      locale: "en",
    });

    expect(
      screen.getByRole("heading", { name: "Vehicle lot could not be loaded" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Vehicle auction not found" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(testState.lotRefetch).toHaveBeenCalledOnce();
  });

  it("keeps a genuine empty lot response as not found", () => {
    renderWithAppProviders(<AuctionDetail auctionId="detail-recovery-lot" />, {
      locale: "en",
    });

    expect(
      screen.getByRole("heading", { name: "Vehicle auction not found" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Browse all auctions" })).toHaveAttribute(
      "href",
      "/auctions",
    );
  });

  it("shows comments loading without claiming the ledger is empty", () => {
    testState.comments = undefined;
    testState.commentsLoading = true;

    renderWithAppProviders(
      <AuctionDetail
        auctionId={demoVehicleAuctions[0].id}
        initialAuction={demoVehicleAuctions[0]}
      />,
      { locale: "en" },
    );

    expect(screen.getByRole("status", { name: "Loading questions…" })).toBeVisible();
    expect(screen.queryByText("No questions yet.")).not.toBeInTheDocument();
  });

  it("shows a comments transport error with retry instead of an empty ledger", async () => {
    testState.comments = undefined;
    testState.commentsError = true;
    const user = userEvent.setup();

    renderWithAppProviders(
      <AuctionDetail
        auctionId={demoVehicleAuctions[0].id}
        initialAuction={demoVehicleAuctions[0]}
      />,
      { locale: "en" },
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Questions could not be loaded.",
    );
    expect(screen.queryByText("No questions yet.")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reload questions" }));
    expect(testState.commentsRefetch).toHaveBeenCalledOnce();
  });

  it("keeps a successful empty comments response as no questions", () => {
    renderWithAppProviders(
      <AuctionDetail
        auctionId={demoVehicleAuctions[0].id}
        initialAuction={demoVehicleAuctions[0]}
      />,
      { locale: "en" },
    );

    expect(screen.getByText("No questions yet.")).toBeVisible();
  });
});
