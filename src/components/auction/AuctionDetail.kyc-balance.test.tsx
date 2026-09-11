import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuctionDetail } from "@/components/auction/AuctionDetail";
import { demoVehicleAuctions } from "@/lib/fixtures/vehicleAuctions";
import { renderWithAppProviders } from "@/test/render";

const testState = vi.hoisted(() => ({
  deposit: vi.fn(),
  depositRequests: [] as Array<{
    onError?: (error: unknown) => void;
    onSuccess?: (data: { message?: string; status?: string }) => void;
  }>,
  push: vi.fn(),
  user: null as Record<string, unknown> | null,
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
    isAuthenticated: testState.user !== null,
    user: testState.user,
  }),
}));

vi.mock("@/hooks/useStomp", () => ({
  useSocket: () => ({ connectionState: "disconnected", connected: false }),
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
  useLot: () => ({ data: null, isLoading: false }),
  useLotCounts: () => ({ data: null, refetch: vi.fn() }),
  useRecLots: () => ({ data: [], isError: false, isFetching: false, isLoading: false, refetch: vi.fn() }),
}));

vi.mock("@/queries/comments", () => ({
  useAllCommentsByVehicle: () => ({ data: [], refetch: vi.fn() }),
  useCreateComment: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock("@/queries/users", () => ({
  useUserDeposits: () => ({
    data: [],
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/queries/deposit", () => ({
  useDepositToAuctionMutation: () => ({
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
  }),
}));

describe("AuctionDetail KYC and balance checks", () => {
  beforeEach(() => {
    testState.deposit.mockClear();
    testState.depositRequests.length = 0;
    testState.push.mockClear();
    testState.user = null;
  });

  it("blocks participation and guides user to KYC when KYC is not approved by admin (PENDING)", () => {
    testState.user = { id: 7, kycStatus: "PENDING" };

    renderWithAppProviders(
      <AuctionDetail
        auctionId={demoVehicleAuctions[0].id}
        initialAuction={demoVehicleAuctions[0]}
      />,
      { locale: "uz" },
    );

    expect(
      screen.getByText("Hujjatlaringiz admin tomonidan tekshirilmoqda. Tasdiqlanishini kuting."),
    ).toBeVisible();

    const verifyLink = screen.getByRole("link", { name: /shaxsni tasdiqlash/i });
    expect(verifyLink).toHaveAttribute("href", "/dashboard/kyc");
    expect(screen.queryByRole("button", { name: /kafolat pulini to‘lash/i })).not.toBeInTheDocument();
  });

  it("blocks participation when KYC is NOT_SUBMITTED", () => {
    testState.user = { id: 7, kycStatus: "NOT_SUBMITTED" };

    renderWithAppProviders(
      <AuctionDetail
        auctionId={demoVehicleAuctions[0].id}
        initialAuction={demoVehicleAuctions[0]}
      />,
      { locale: "uz" },
    );

    expect(
      screen.getByText("Auksionda ishtirok etish va kafolat puli to‘lash uchun shaxsingiz tasdiqlangan (KYC) bo‘lishi shart."),
    ).toBeVisible();

    const verifyLink = screen.getByRole("link", { name: /shaxsni tasdiqlash/i });
    expect(verifyLink).toHaveAttribute("href", "/dashboard/kyc");
  });

  it("shows insufficient balance message when user balance is less than required deposit", async () => {
    const user = userEvent.setup();
    testState.user = { id: 7, kycStatus: "APPROVED", balance: 50000 };

    const futureAuction = {
      ...demoVehicleAuctions[0],
      status: "upcoming" as const,
      startTime: "2099-01-01T00:00:00.000Z",
      endTime: "2099-01-02T00:00:00.000Z",
    };

    renderWithAppProviders(
      <AuctionDetail
        auctionId={futureAuction.id}
        initialAuction={futureAuction}
      />,
      { locale: "uz" },
    );

    await user.click(screen.getByRole("button", { name: /kafolat pulini to‘lash/i }));
    expect(screen.getByRole("dialog", { name: /kafolat pulini tasdiqlash/i })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Kafolat pulini tasdiqlash" }));

    await waitFor(() => {
      expect(
        screen.getByText("Hisobingizda mablag‘ yetarli emas. Iltimos, hisobingizni to‘ldiring."),
      ).toBeVisible();
    });

    // Backend mutation was prevented
    expect(testState.deposit).not.toHaveBeenCalled();
  });

  it("translates backend Insufficient balance error message to user-friendly text", async () => {
    const user = userEvent.setup();
    testState.user = { id: 7, kycStatus: "APPROVED" };

    const futureAuction = {
      ...demoVehicleAuctions[0],
      status: "upcoming" as const,
      startTime: "2099-01-01T00:00:00.000Z",
      endTime: "2099-01-02T00:00:00.000Z",
    };

    renderWithAppProviders(
      <AuctionDetail
        auctionId={futureAuction.id}
        initialAuction={futureAuction}
      />,
      { locale: "uz" },
    );

    await user.click(screen.getByRole("button", { name: /kafolat pulini to‘lash/i }));
    await user.click(screen.getByRole("button", { name: "Kafolat pulini tasdiqlash" }));

    await waitFor(() => {
      expect(testState.depositRequests.length).toBe(1);
    });

    act(() => {
      testState.depositRequests[0]?.onError?.({
        response: { data: { message: "Insufficient balance", status: "ERROR" } },
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText("Hisobingizda mablag‘ yetarli emas. Iltimos, hisobingizni to‘ldiring."),
      ).toBeVisible();
    });
  });
});
