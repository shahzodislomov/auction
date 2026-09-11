import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuctionDetail } from "@/components/auction/AuctionDetail";
import { demoVehicleAuctions } from "@/lib/fixtures/vehicleAuctions";
import { renderWithAppProviders } from "@/test/render";

const testState = vi.hoisted(() => ({
  countsRefetch: vi.fn(),
  deposit: vi.fn(),
  depositHookError: undefined as ((error: unknown) => void) | undefined,
  depositHookSuccess: undefined as ((data: unknown) => void) | undefined,
  depositRequests: [] as Array<{
    onError?: (error: unknown) => void;
    onSuccess?: (data: { message?: string; status?: string }) => void;
  }>,
  depositsRefetch: vi.fn(),
  depositsData: [] as unknown,
  depositsError: false,
  lotData: null as Record<string, unknown> | null,
  push: vi.fn(),
  socketConnected: false,
  subscribe: vi.fn(),
  userId: 19 as string | number | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: testState.push }),
}));

vi.mock("@/api/api", () => ({
  api: { post: vi.fn(() => Promise.resolve({ data: {} })) },
}));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => ({
    isAuthenticated: testState.userId !== null,
    user: testState.userId === null ? null : { id: testState.userId },
  }),
}));

vi.mock("@/hooks/useStomp", () => ({
  useSocket: () => testState.socketConnected
    ? { connectionState: "connected", connected: true, publish: vi.fn(), subscribe: testState.subscribe }
    : { connectionState: "disconnected", connected: false },
}));

vi.mock("@/components/auction/AuctionGallery", () => ({
  AuctionGallery: () => <div data-testid="auction-gallery" />,
}));

vi.mock("@/components/auction/AuctionFacts", () => ({
  AuctionFacts: () => <div data-testid="auction-facts" />,
}));

vi.mock("@/queries/lots", () => ({
  useLikeLotMutation: () => ({ isPending: false, mutate: vi.fn() }),
  useLikedLots: () => ({ data: [], refetch: vi.fn() }),
  useLot: () => ({ data: testState.lotData, isLoading: false }),
  useLotCounts: () => ({ data: null, refetch: testState.countsRefetch }),
  useRecLots: () => ({
    data: [],
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/queries/comments", () => ({
  useAllCommentsByVehicle: () => ({ data: [], refetch: vi.fn() }),
  useCreateComment: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock("@/queries/users", () => ({
  useUserDeposits: () => ({
    data: testState.depositsData,
    isError: testState.depositsError,
    isFetching: false,
    isLoading: false,
    refetch: testState.depositsRefetch,
  }),
}));

vi.mock("@/queries/deposit", () => ({
  useDepositToAuctionMutation: (
    onSuccess?: (data: unknown) => void,
    onError?: (error: unknown) => void,
  ) => {
    testState.depositHookSuccess = onSuccess;
    testState.depositHookError = onError;
    return {
      isPending: false,
      mutate: (
        variables: unknown,
        options?: {
          onError?: (error: unknown) => void;
          onSuccess?: (data: { message?: string; status?: string }) => void;
        },
      ) => {
        testState.deposit(variables);
        testState.depositRequests.push(options ?? {});
      },
    };
  },
}));

function completeDeposit(
  data: { message?: string; status?: string },
  requestIndex = testState.depositRequests.length - 1,
) {
  testState.depositHookSuccess?.(data);
  testState.depositRequests[requestIndex]?.onSuccess?.(data);
}

describe("AuctionDetail deposit scope", () => {
  beforeEach(() => {
    testState.deposit.mockClear();
    testState.countsRefetch.mockClear();
    testState.depositHookError = undefined;
    testState.depositHookSuccess = undefined;
    testState.depositRequests.length = 0;
    testState.depositsRefetch.mockClear();
    testState.depositsData = [];
    testState.depositsError = false;
    testState.lotData = null;
    testState.push.mockClear();
    testState.socketConnected = false;
    testState.subscribe.mockReset();
    testState.subscribe.mockImplementation(() => ({ unsubscribe: vi.fn() }));
    testState.userId = 19;
    window.localStorage.clear();
    window.localStorage.setItem("userId", "7");
  });

  it("does not apply account A's in-flight deposit success to account B", async () => {
    const user = userEvent.setup();
    const auction = { ...demoVehicleAuctions[0], status: "upcoming" as const };
    const view = renderWithAppProviders(
      <AuctionDetail auctionId={auction.id} initialAuction={auction} />,
      { locale: "en" },
    );

    await user.click(screen.getByRole("button", { name: /pay 1% deposit/i }));
    const dialog = screen.getByRole("dialog", { name: /confirm deposit/i });
    await user.click(
      within(dialog).getByRole("button", { name: /confirm deposit/i }),
    );
    expect(testState.deposit).toHaveBeenCalledWith({
      auctionId: 10245,
      userId: 19,
    });

    testState.userId = 23;
    view.rerender(
      <AuctionDetail auctionId={auction.id} initialAuction={auction} />,
    );

    await act(async () => {
      completeDeposit({ status: "OK" }, 0);
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /pay 1% deposit/i }),
      ).toBeVisible(),
    );
    expect(
      screen.queryByRole("link", { name: /enter live auction/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/deposit accepted/i)).not.toBeInTheDocument();
  });

  it("blocks another payment when existing deposit status cannot be confirmed", async () => {
    const user = userEvent.setup();
    testState.depositsData = undefined;
    testState.depositsError = true;
    const auction = { ...demoVehicleAuctions[0], status: "upcoming" as const };

    renderWithAppProviders(
      <AuctionDetail auctionId={auction.id} initialAuction={auction} />,
      { locale: "en" },
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      /deposit status is unavailable/i,
    );
    expect(
      screen.getByRole("button", { name: /pay 1% deposit/i }),
    ).toBeDisabled();
    await user.click(
      screen.getByRole("button", { name: /refresh deposit status/i }),
    );
    expect(testState.depositsRefetch).toHaveBeenCalledTimes(1);
    expect(testState.deposit).not.toHaveBeenCalled();
  });

  it.each([
    ["an ERROR response", { message: "Deposit rejected", status: "ERROR" }],
    ["a malformed response", {}],
  ])("does not report deposit success for %s", async (_label, response) => {
    const user = userEvent.setup();
    const auction = { ...demoVehicleAuctions[0], status: "upcoming" as const };
    renderWithAppProviders(
      <AuctionDetail auctionId={auction.id} initialAuction={auction} />,
      { locale: "en" },
    );

    await user.click(screen.getByRole("button", { name: /pay 1% deposit/i }));
    await user.click(
      within(screen.getByRole("dialog", { name: /confirm deposit/i })).getByRole(
        "button",
        { name: /confirm deposit/i },
      ),
    );

    await act(async () => {
      completeDeposit(response);
      await Promise.resolve();
    });

    expect(screen.getByRole("button", { name: /pay 1% deposit/i })).toBeVisible();
    expect(screen.queryByRole("link", { name: /enter live auction/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/deposit accepted/i)).not.toBeInTheDocument();
    expect(testState.depositsRefetch).not.toHaveBeenCalled();
  });

  it("clears auction-scoped dialogs immediately when the route id changes", async () => {
    const user = userEvent.setup();
    const auctionA = { ...demoVehicleAuctions[0], status: "upcoming" as const };
    const auctionB = { ...demoVehicleAuctions[1], status: "upcoming" as const };
    const view = renderWithAppProviders(
      <AuctionDetail auctionId={auctionA.id} initialAuction={auctionA} />,
      { locale: "en" },
    );

    await user.click(screen.getByRole("button", { name: /pay 1% deposit/i }));
    expect(screen.getByRole("dialog", { name: /confirm deposit/i })).toBeVisible();

    view.rerender(
      <AuctionDetail auctionId={auctionB.id} initialAuction={auctionB} />,
    );

    expect(screen.queryByRole("dialog", { name: /confirm deposit/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: auctionB.title.en ?? auctionB.title.default ?? "" }),
    ).toBeVisible();
    expect(screen.queryByText(auctionA.title.en ?? "")).not.toBeInTheDocument();
  });
});
