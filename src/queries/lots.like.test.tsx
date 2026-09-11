"use client";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLikeLotMutation, useLikedLots } from "@/queries/lots";

const queryMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();

  return {
    ...actual,
    useMutation: queryMocks.useMutation,
    useQuery: queryMocks.useQuery,
    useQueryClient: () => ({ invalidateQueries: queryMocks.invalidateQueries }),
  };
});

vi.mock("@/api/api", () => ({
  api: {
    get: queryMocks.get,
    put: queryMocks.put,
    post: queryMocks.post,
    delete: queryMocks.delete,
  },
}));

describe("useLikeLotMutation", () => {
  beforeEach(() => {
    queryMocks.invalidateQueries.mockReset();
    queryMocks.get.mockReset();
    queryMocks.put.mockReset();
    queryMocks.post.mockReset();
    queryMocks.delete.mockReset();
    queryMocks.useMutation.mockReset();
    queryMocks.useQuery.mockReset();
    queryMocks.useMutation.mockImplementation((options) => options);
    queryMocks.useQuery.mockImplementation((options) => options);
    queryMocks.post.mockResolvedValue({ data: { id: "42", liked: true } });
    queryMocks.delete.mockResolvedValue({ data: { id: "42", unliked: true } });
  });

  it("uses the TanStack v5 object signature and invalidates every affected query", async () => {
    const onSuccess = vi.fn();
    renderHook(() => useLikeLotMutation(onSuccess));

    expect(queryMocks.useMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    );

    const options = queryMocks.useMutation.mock.calls[0][0];
    const variables = { lotId: "42", userId: "7", isLiked: false };
    const data = await options.mutationFn(variables);
    await options.onSuccess(data, variables);

    expect(queryMocks.post).toHaveBeenCalledWith("/favorites/42");
    expect(queryMocks.invalidateQueries.mock.calls.map(([filters]) => filters)).toEqual(
      expect.arrayContaining([
        { queryKey: ["allLots"] },
        { queryKey: ["allLotsAvailable"] },
        { queryKey: ["initialLots"] },
        { queryKey: ["lot", "42"] },
        { queryKey: ["like", "7"] },
      ]),
    );
    expect(onSuccess).toHaveBeenCalledWith({ id: "42", liked: true, status: "LIKED" });
  });

  it("uses one canonical liked-lots key for numeric and string account ids", async () => {
    queryMocks.get.mockResolvedValue({ data: { data: { content: [] } } });
    renderHook(() => useLikedLots(7));
    const queryOptions = queryMocks.useQuery.mock.calls[0][0];

    expect(queryOptions.queryKey).toEqual(["like", "7"]);
    await queryOptions.queryFn();
    expect(queryMocks.get).toHaveBeenCalledWith("/favorites", { params: { size: 100 } });

    renderHook(() => useLikeLotMutation());
    const mutationOptions = queryMocks.useMutation.mock.calls[0][0];
    await mutationOptions.onSuccess({ liked: true }, { lotId: "42", userId: "7" });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["like", "7"] });
  });

  it("rejects an explicit ERROR response before invalidating or reporting success", async () => {
    const onSuccess = vi.fn();
    queryMocks.post.mockResolvedValueOnce({
      data: {
        liked: true,
        message: "Like rejected",
        status: "ERROR",
      },
    });
    renderHook(() => useLikeLotMutation(onSuccess));
    const options = queryMocks.useMutation.mock.calls[0][0];

    await expect(
      options.mutationFn({ lotId: "42", userId: "7", isLiked: false }),
    ).rejects.toThrow("Like rejected");
    expect(queryMocks.invalidateQueries).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("disables liked-lots fetching for the anonymous zero sentinel", () => {
    renderHook(() => useLikedLots(0));

    const options = queryMocks.useQuery.mock.calls[0][0];
    expect(options.queryKey).toEqual(["like", ""]);
    expect(options.enabled).toBe(false);
    expect(queryMocks.get).not.toHaveBeenCalled();
  });
});
