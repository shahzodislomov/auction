"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useApproveLotMutation, useDeclineLotMutation } from "@/queries/lots";
import { useCreateLotTypeMutation } from "@/queries/lot-types";
import { useAddBalance } from "@/queries/users";

const apiSpies = vi.hoisted(() => ({
  post: vi.fn(),
  patch: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: { post: apiSpies.post, patch: apiSpies.patch },
}));

vi.mock("react-toastify", () => ({
  toast: { error: apiSpies.toastError, success: apiSpies.toastSuccess },
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("connected admin mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiSpies.post.mockResolvedValue({ data: { status: "OK" } });
    apiSpies.patch.mockResolvedValue({ data: { status: "OK" } });
  });

  it("executes lot approval through the real TanStack v5 mutation and invalidates connected queues", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useApproveLotMutation(), {
      wrapper: createWrapper(queryClient),
    });
    const approve = result.current as unknown as {
      mutateAsync: (id: string) => Promise<unknown>;
    };

    await act(async () => {
      await approve.mutateAsync("71");
    });

    expect(apiSpies.patch).toHaveBeenCalledWith("/auctions/admin/71/approve");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["lot", "71"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allLotsAvailable"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["initialLots"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allLotsApproved"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allLotsNotApproved"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["lotStatistics"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["monthlyStats"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["statisticsByUserId"] });
  });

  it("invalidates the declined lot and all connected public queues", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeclineLotMutation(), {
      wrapper: createWrapper(queryClient),
    });
    const decline = result.current as unknown as {
      mutateAsync: (id: string) => Promise<unknown>;
    };

    await act(async () => {
      await decline.mutateAsync("72");
    });

    expect(apiSpies.patch).toHaveBeenCalledWith("/auctions/admin/72/reject");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["lot", "72"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allLotsAvailable"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["initialLots"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allLotsApproved"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allLotsNotApproved"] });
    expect(apiSpies.toastSuccess).toHaveBeenCalledWith("Лот успешно отклонён!");
  });

  it("executes a balance update with the real mutation contract", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useAddBalance(), {
      wrapper: createWrapper(queryClient),
    });
    const addBalance = result.current as unknown as {
      mutateAsync: (variables: { balance: number; userId: number }) => Promise<unknown>;
    };

    await act(async () => {
      await addBalance.mutateAsync({ balance: 50000, userId: 8 });
    });

    expect(apiSpies.post).toHaveBeenCalledWith(
      "/user/addBalance?userId=8&balance=50000",
    );
    expect(invalidate.mock.calls.map(([filters]) => filters)).toEqual(
      expect.arrayContaining([
        { queryKey: ["user", 8] },
        { queryKey: ["user", "8"] },
        { queryKey: ["userTransactions"] },
        { queryKey: ["statisticsByUserId"] },
        { queryKey: ["currentUser"] },
        { queryKey: ["tranStatistics"] },
      ]),
    );
  });

  it("rejects an application-level ERROR instead of toasting approval success", async () => {
    apiSpies.patch.mockResolvedValueOnce({ data: { status: "ERROR" } });
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useApproveLotMutation(), {
      wrapper: createWrapper(queryClient),
    });
    const approve = result.current as unknown as {
      mutateAsync: (id: string) => Promise<unknown>;
    };

    await act(async () => {
      await expect(approve.mutateAsync("71")).rejects.toThrow(
        /did not confirm/i,
      );
    });

    expect(apiSpies.toastSuccess).not.toHaveBeenCalled();
    expect(apiSpies.toastError).toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("does not invalidate financial truth for an unconfirmed balance update", async () => {
    apiSpies.post.mockResolvedValueOnce({ data: { status: "ERROR" } });
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useAddBalance(), {
      wrapper: createWrapper(queryClient),
    });
    const addBalance = result.current as unknown as {
      mutateAsync: (variables: { balance: number; userId: number }) => Promise<unknown>;
    };

    await act(async () => {
      await expect(
        addBalance.mutateAsync({ balance: 50000, userId: 8 }),
      ).rejects.toThrow(/did not confirm/i);
    });

    expect(invalidate).not.toHaveBeenCalled();
  });

  it("rejects a malformed Axios success body for balance updates", async () => {
    apiSpies.post.mockResolvedValueOnce({ data: {} });
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const { result } = renderHook(() => useAddBalance(), {
      wrapper: createWrapper(queryClient),
    });
    const addBalance = result.current as unknown as {
      mutateAsync: (variables: { balance: number; userId: number }) => Promise<unknown>;
    };

    await act(async () => {
      await expect(
        addBalance.mutateAsync({ balance: 50000, userId: 8 }),
      ).rejects.toThrow(/did not confirm/i);
    });
  });

  it("rejects a malformed raw reference-data body", async () => {
    apiSpies.post.mockResolvedValueOnce({ data: { message: "created" } });
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const { result } = renderHook(() => useCreateLotTypeMutation(), {
      wrapper: createWrapper(queryClient),
    });
    const createType = result.current as unknown as {
      mutateAsync: (variables: { image: File | null; name: string }) => Promise<unknown>;
    };

    await act(async () => {
      await expect(
        createType.mutateAsync({ image: null, name: "Car" }),
      ).rejects.toThrow(/did not confirm/i);
    });
  });
});
