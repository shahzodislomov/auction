"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useMarkDeletedMutation, useUpdateLotMutation } from "./lots";

const mocks = vi.hoisted(() => ({
  delete: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: { delete: mocks.delete, put: mocks.put, patch: mocks.patch },
}));

function executeMutation(mutation: { mutateAsync: unknown }, payload: unknown) {
  return (mutation.mutateAsync as (variables: unknown) => Promise<unknown>)(payload);
}

describe("connected seller lot mutations", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.delete.mockResolvedValue({ data: { status: "OK" } });
    mocks.put.mockResolvedValue({ data: { status: "OK" } });
    mocks.patch.mockResolvedValue({ data: { status: "OK" } });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  it("archives through TanStack v5 and invalidates seller-facing lot queries", async () => {
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useMarkDeletedMutation(), { wrapper: Wrapper });

    await act(async () => {
      await executeMutation(result.current, "42");
    });

    expect(mocks.patch).toHaveBeenCalledWith("/admin/vehicles/42/reject");
    expect(invalidate.mock.calls.map(([filters]) => filters)).toEqual(expect.arrayContaining([
      { queryKey: ["lot", "42"] },
      { queryKey: ["lotsBySellerId"] },
      { queryKey: ["allLotsAvailable"] },
      { queryKey: ["allLots"] },
      { queryKey: ["initialLots"] },
      { queryKey: ["lotStatistics"] },
      { queryKey: ["monthlyStats"] },
      { queryKey: ["statisticsByUserId"] },
    ]));
  });

  it("updates the owned lot payload and rejects unconfirmed mutation responses", async () => {
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const payload = { id: 42, sellerId: 7, title: "Updated" };
    const { result } = renderHook(() => useUpdateLotMutation(), { wrapper: Wrapper });

    await act(async () => {
      await executeMutation(result.current, payload);
    });
    expect(mocks.put).toHaveBeenCalledWith("/vehicles/42", payload);
    expect(invalidate.mock.calls.map(([filters]) => filters)).toEqual(expect.arrayContaining([
      { queryKey: ["lot", 42] },
      { queryKey: ["lot", "42"] },
      { queryKey: ["lotsBySellerId"] },
      { queryKey: ["initialLots"] },
    ]));

    mocks.put.mockResolvedValueOnce({ data: { status: "ERROR" } });
    await act(async () => {
      await expect(executeMutation(result.current, payload)).rejects.toThrow(/did not confirm/i);
    });
  });
});
