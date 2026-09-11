"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchAuctionDeposits,
  fetchAuctionDepositStatus,
  useDepositToAuctionMutation,
} from "./deposit";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: { get: mocks.get, post: mocks.post },
}));

function executeMutation(
  mutation: { mutateAsync: unknown },
  payload: { auctionId: number; userId: number },
) {
  return (mutation.mutateAsync as (variables: typeof payload) => Promise<unknown>)(payload);
}

describe("deposit mutation truth and cache scope", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  it("rejects an HTTP-200 ERROR response without invalidating or reporting success", async () => {
    mocks.post.mockResolvedValue({
      data: { message: "Insufficient balance", status: "ERROR" },
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useDepositToAuctionMutation(onSuccess), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(
        executeMutation(result.current, { auctionId: 42, userId: 7 }),
      ).rejects.toThrow(/did not confirm/i);
    });

    expect(invalidate).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("invalidates the successful depositor's activity, statistics, and profile caches", async () => {
    const response = { message: "Accepted", status: "OK" };
    mocks.post.mockResolvedValue({ data: response });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDepositToAuctionMutation(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await executeMutation(result.current, { auctionId: 42, userId: 7 });
    });

    expect(mocks.post).toHaveBeenCalledWith("/deposit/depositToAuction", {
      auctionId: 42,
      userId: 7,
    });

    expect(invalidate.mock.calls.map(([filters]) => filters)).toEqual(
      expect.arrayContaining([
        { queryKey: ["userDeposits", 7] },
        { queryKey: ["userDeposits", "7"] },
        { queryKey: ["userTransactions"] },
        { queryKey: ["userTransactions", "7"] },
        { queryKey: ["statisticsByUserId", "7"] },
        { queryKey: ["user", 7] },
        { queryKey: ["user", "7"] },
        { queryKey: ["currentUser"] },
        { queryKey: ["tranStatistics"] },
      ]),
    );
  });

  it("loads auction deposits with pagination", async () => {
    const response = { data: { data: { content: [] }, status: "OK" } };
    mocks.get.mockResolvedValue(response);

    await expect(fetchAuctionDeposits(42, 2, 25)).resolves.toEqual(response.data);
    expect(mocks.get).toHaveBeenCalledWith("/deposit/getAuctionDeposits/42", {
      params: { page: 2, size: 25 },
    });
  });

  it("loads the authenticated user's auction deposit status", async () => {
    const response = { data: { data: { status: "BLOCKED" }, status: "OK" } };
    mocks.get.mockResolvedValue(response);

    await expect(fetchAuctionDepositStatus(7, 42)).resolves.toEqual(response.data);
    expect(mocks.get).toHaveBeenCalledWith("/deposit/getAuctionDepositStatus", {
      params: { userId: 7, auctionId: 42 },
    });
  });
});
