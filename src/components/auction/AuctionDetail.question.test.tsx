import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuctionDetail } from "@/components/auction/AuctionDetail";
import { demoVehicleAuctions } from "@/lib/fixtures/vehicleAuctions";
import { renderWithAppProviders } from "@/test/render";

const testState = vi.hoisted(() => ({
  commentsRefetch: vi.fn(),
  createComment: vi.fn(),
  outcome: "error" as "error" | "network" | "pending" | "success",
  pendingOptions: null as {
    onError?: (error: unknown) => void;
    onSuccess?: (response: { message?: string; status?: string }) => void;
  } | null,
  userId: 19,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/api/api", () => ({
  api: { post: vi.fn(() => Promise.resolve({ data: {} })) },
}));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => ({
    isAuthenticated: true,
    user: { id: testState.userId },
  }),
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

vi.mock("@/queries/lots", () => ({
  useLikeLotMutation: () => ({ isPending: false, mutate: vi.fn() }),
  useLikedLots: () => ({ data: [], refetch: vi.fn() }),
  useLot: () => ({ data: null, isLoading: false }),
  useLotCounts: () => ({ data: null }),
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
    data: [],
    refetch: testState.commentsRefetch,
  }),
  useCreateComment: () => ({
    isPending: false,
    mutate: (
      payload: unknown,
      options?: {
        onError?: (error: unknown) => void;
        onSuccess?: (response: { message?: string; status?: string }) => void;
      },
    ) => {
      testState.createComment(payload);
      if (testState.outcome === "pending") {
        testState.pendingOptions = options ?? null;
        return;
      }
      if (testState.outcome === "network") {
        options?.onError?.(new Error("offline"));
        return;
      }
      options?.onSuccess?.(
        testState.outcome === "success"
          ? { status: "OK" }
          : { status: "ERROR", message: "rejected" },
      );
    },
  }),
}));

vi.mock("@/queries/users", () => ({
  useUserDeposits: () => ({ data: [], refetch: vi.fn() }),
}));

vi.mock("@/queries/deposit", () => ({
  useDepositToLotMutation: () => ({ isPending: false, mutate: vi.fn() }),
  useDepositToAuctionMutation: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe("AuctionDetail question truthfulness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testState.outcome = "error";
    testState.pendingOptions = null;
    testState.userId = 19;
    window.localStorage.clear();
    window.localStorage.setItem("userId", "19");
  });

  it.each(["error", "network"] as const)(
    "preserves the question and announces a localized failure after %s",
    async (outcome) => {
      testState.outcome = outcome;
      const user = userEvent.setup();
      const auction = { ...demoVehicleAuctions[0], status: "upcoming" as const };
      renderWithAppProviders(
        <AuctionDetail auctionId={auction.id} initialAuction={auction} />,
        { locale: "en" },
      );

      const question = "Is the complete service history available?";
      const field = screen.getByLabelText("Question for the seller");
      await user.type(field, question);
      await user.click(screen.getByRole("button", { name: "Send question" }));

      expect(field).toHaveValue(question);
      expect(
        screen.getByText("The question could not be sent. Your text remains in the form."),
      ).toBeVisible();
      expect(screen.queryByText("Question sent.")).not.toBeInTheDocument();
      expect(testState.commentsRefetch).not.toHaveBeenCalled();
    },
  );

  it("clears and confirms the question only after an explicit OK response", async () => {
    testState.outcome = "success";
    const user = userEvent.setup();
    const auction = { ...demoVehicleAuctions[0], status: "upcoming" as const };
    renderWithAppProviders(
      <AuctionDetail auctionId={auction.id} initialAuction={auction} />,
      { locale: "en" },
    );

    const field = screen.getByLabelText("Question for the seller");
    await user.type(field, "Is the complete service history available?");
    await user.click(screen.getByRole("button", { name: "Send question" }));

    expect(field).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent("Question sent.");
    expect(testState.commentsRefetch).toHaveBeenCalledOnce();
  });

  it("does not clear or confirm the next account's draft after a delayed response", async () => {
    testState.outcome = "pending";
    const user = userEvent.setup();
    const auction = { ...demoVehicleAuctions[0], status: "upcoming" as const };
    const view = renderWithAppProviders(
      <AuctionDetail auctionId={auction.id} initialAuction={auction} />,
      { locale: "en" },
    );

    const field = screen.getByLabelText("Question for the seller");
    await user.type(field, "Account A question");
    await user.click(screen.getByRole("button", { name: "Send question" }));
    expect(testState.pendingOptions).not.toBeNull();

    testState.userId = 20;
    window.localStorage.setItem("userId", "20");
    view.rerender(
      <AuctionDetail auctionId={auction.id} initialAuction={auction} />,
    );

    expect(field).toHaveValue("");
    await user.type(field, "Account B draft");
    act(() => {
      testState.pendingOptions?.onSuccess?.({ status: "OK" });
    });

    expect(field).toHaveValue("Account B draft");
    expect(screen.queryByText("Question sent.")).not.toBeInTheDocument();
    expect(testState.commentsRefetch).not.toHaveBeenCalled();
  });
});
