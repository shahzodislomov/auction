import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuctionDetail } from "@/components/auction/AuctionDetail";
import { demoVehicleAuctions } from "@/lib/fixtures/vehicleAuctions";
import { renderWithAppProviders } from "@/test/render";

const testState = vi.hoisted(() => ({
  recommendations: [] as unknown[],
  recommendationsError: false,
  recommendationsLoading: false,
  recommendationsRefetch: vi.fn(),
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

vi.mock("@/queries/auction-listings", () => ({
  useAuction: () => ({ data: null, isLoading: false }),
  useAuctions: () => ({
    data: testState.recommendations,
    isError: testState.recommendationsError,
    isFetching: false,
    isLoading: testState.recommendationsLoading,
    refetch: testState.recommendationsRefetch,
  }),
}));

vi.mock("@/queries/lots", () => ({
  useLikeLotMutation: () => ({ isPending: false, mutate: vi.fn() }),
  useLikedLots: () => ({ data: [], refetch: vi.fn() }),
  useLot: () => ({ data: null, isLoading: false }),
  useLotCounts: () => ({ data: null, refetch: vi.fn() }),
  useRecLots: () => ({
    data: testState.recommendations,
    isError: testState.recommendationsError,
    isFetching: false,
    isLoading: testState.recommendationsLoading,
    refetch: testState.recommendationsRefetch,
  }),
}));

vi.mock("@/queries/comments", () => ({
  useAllCommentsByVehicle: () => ({ data: [], refetch: vi.fn() }),
  useCreateComment: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock("@/queries/users", () => ({
  useUserDeposits: () => ({ data: [], refetch: vi.fn() }),
}));

vi.mock("@/queries/deposit", () => ({
  useDepositToVehicleMutation: () => ({ isPending: false, mutate: vi.fn() }),
  useDepositToAuctionMutation: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe("AuctionDetail completeness", () => {
  beforeEach(() => {
    testState.recommendations = [];
    testState.recommendationsError = false;
    testState.recommendationsLoading = false;
    testState.recommendationsRefetch.mockClear();
    window.localStorage.clear();
  });

  it("shows only supplied condition and localized damage disclosure", () => {
    const auction = {
      ...demoVehicleAuctions[0],
      condition: "Factory-certified used",
      damage: {
        default: null,
        uz: "Orqa bamper ta'mirlangan.",
        ru: "Задний бампер отремонтирован.",
        en: "Rear bumper repaired.",
      },
    };

    renderWithAppProviders(
      <AuctionDetail auctionId={auction.id} initialAuction={auction} />,
      { locale: "en" },
    );

    expect(
      screen.getByRole("heading", {
        name: "Condition and damage disclosure",
      }),
    ).toBeVisible();
    expect(screen.getByText("Factory-certified used")).toBeVisible();
    expect(screen.getByText("Rear bumper repaired.")).toBeVisible();
  });

  it("renders returned vehicle recommendations and excludes the current lot", () => {
    testState.recommendations = [
      {
        id: demoVehicleAuctions[0].id,
        lotType: { name: "CAR" },
        title: "Duplicate current lot",
      },
      {
        id: 204,
        lotType: { name: "CAR" },
        lotStatus: "UPCOMING",
        title: "Related Chevrolet Tracker",
        startPrice: 245_000_000,
        currency: "UZS",
      },
      {
        id: 205,
        lotType: { name: "ELECTRONICS" },
        title: "Unrelated television",
      },
    ];

    renderWithAppProviders(
      <AuctionDetail
        auctionId={demoVehicleAuctions[0].id}
        initialAuction={demoVehicleAuctions[0]}
      />,
      { locale: "en" },
    );

    const heading = screen.getByRole("heading", { name: "Related auctions" });
    const section = heading.closest("section");
    expect(section).not.toBeNull();
    expect(
      within(section as HTMLElement).getByText(/Chevrolet Tracker/i),
    ).toBeVisible();
    expect(
      within(section as HTMLElement).queryByText("Duplicate current lot"),
    ).not.toBeInTheDocument();
    expect(
      within(section as HTMLElement).queryByText("Unrelated television"),
    ).not.toBeInTheDocument();
  });

  it("shows honest loading, error/retry, and empty recommendation states", async () => {
    const user = userEvent.setup();
    testState.recommendationsLoading = true;
    const view = renderWithAppProviders(
      <AuctionDetail
        auctionId={demoVehicleAuctions[0].id}
        initialAuction={demoVehicleAuctions[0]}
      />,
      { locale: "en" },
    );

    expect(screen.getByRole("status", { name: "Loading related auctions…" })).toBeVisible();

    testState.recommendationsLoading = false;
    testState.recommendationsError = true;
    view.rerender(
      <AuctionDetail
        auctionId={demoVehicleAuctions[0].id}
        initialAuction={demoVehicleAuctions[0]}
      />,
    );

    expect(
      screen.getByText("Related auctions are unavailable right now."),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(testState.recommendationsRefetch).toHaveBeenCalledOnce();

    testState.recommendationsError = false;
    view.rerender(
      <AuctionDetail
        auctionId={demoVehicleAuctions[0].id}
        initialAuction={demoVehicleAuctions[0]}
      />,
    );
    expect(
      screen.getByText("No related vehicle auctions were returned."),
    ).toBeVisible();
  });
});
