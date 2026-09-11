"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateComment } from "./comments";

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: { post: mocks.post },
}));

function executeMutation(mutation: { mutateAsync: unknown }) {
  return (mutation.mutateAsync as (payload: {
    comment: string;
    lotId: number;
    parentComment: null;
    type: string;
    userId: number;
  }) => Promise<unknown>)({
    comment: "Is service history available?",
    lotId: 42,
    parentComment: null,
    type: "QUESTION",
    userId: 19,
  });
}

describe("useCreateComment", () => {
  let queryClient: QueryClient;
  let invalidateQueries: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  it("rejects an application-level ERROR and leaves comment caches untouched", async () => {
    mocks.post.mockResolvedValue({ data: { status: "ERROR", message: "rejected" } });
    const { result } = renderHook(() => useCreateComment(), { wrapper: Wrapper });

    await act(async () => {
      await expect(executeMutation(result.current)).rejects.toThrow(
        "server did not confirm",
      );
    });

    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it("invalidates comments only after an explicit OK response", async () => {
    mocks.post.mockResolvedValue({ data: { status: "OK" } });
    const { result } = renderHook(() => useCreateComment(), { wrapper: Wrapper });

    await act(async () => {
      await executeMutation(result.current);
    });

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["allComments"] });
  });
});
