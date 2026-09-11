"use client";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateLotMutation } from "@/queries/lots";

const queryMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  post: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();

  return {
    ...actual,
    useMutation: queryMocks.useMutation,
    useQueryClient: () => ({ invalidateQueries: queryMocks.invalidateQueries }),
  };
});

vi.mock("@/api/api", () => ({
  api: { post: queryMocks.post },
}));

describe("useCreateLotMutation", () => {
  beforeEach(() => {
    queryMocks.post.mockReset();
    queryMocks.invalidateQueries.mockReset();
    queryMocks.useMutation.mockReset();
    queryMocks.useMutation.mockImplementation((options) => options);
    queryMocks.post.mockResolvedValue({ data: { status: "CREATED" } });
  });

  it("uses the TanStack v5 object signature and keeps vehicle files in multipart data", async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    renderHook(() => useCreateLotMutation(onSuccess, onError));

    expect(queryMocks.useMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
        onError,
        onSuccess: expect.any(Function),
      }),
    );

    const options = queryMocks.useMutation.mock.calls[0][0];
    const image = new File(["vehicle"], "vehicle.jpg", { type: "image/jpeg" });
    const document = new File(["ownership"], "ownership.pdf", {
      type: "application/pdf",
    });
    const response = await options.mutationFn({
      documents: [document],
      images: [image],
      sellerId: 7,
      title: "2024 Chevrolet Tahoe",
    });

    const [url, body, config] = queryMocks.post.mock.calls[0];
    expect(url).toBe("/auctions/create-with-vehicle");
    expect(body).toBeInstanceOf(FormData);
    expect(body.getAll("documents")).toEqual([document]);
    expect(body.getAll("images")).toEqual([image]);
    expect(config.params.has("documents")).toBe(false);
    expect(config.params.get("sellerId")).toBe("7");
    expect(config.params.get("title")).toBe("2024 Chevrolet Tahoe");
    expect(response).toEqual({ status: "CREATED" });

    await options.onSuccess(response);
    expect(onSuccess).toHaveBeenCalledWith({ status: "CREATED" });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["lotsBySellerId"],
    });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["allLotsAvailable"],
    });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["lotStatistics"],
    });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["monthlyStats"],
    });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["statisticsByUserId"],
    });
  });

  it("does not invalidate cached lots when creation is not explicitly confirmed", async () => {
    const onSuccess = vi.fn();
    renderHook(() => useCreateLotMutation(onSuccess));
    const options = queryMocks.useMutation.mock.calls[0][0];

    await options.onSuccess({ status: "ERROR" });

    expect(onSuccess).toHaveBeenCalledWith({ status: "ERROR" });
    expect(queryMocks.invalidateQueries).not.toHaveBeenCalled();
  });
});
