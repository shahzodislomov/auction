"use client";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUserStatistics } from "./statistics";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return { ...actual, useQuery: mocks.useQuery };
});

vi.mock("@/api/api", () => ({ api: { get: mocks.get } }));

describe("useUserStatistics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQuery.mockImplementation((options) => options);
    mocks.get.mockResolvedValue({ data: { data: { bidCount: 4 } } });
  });

  it("uses the canonical account key and existing user-statistics endpoint", async () => {
    renderHook(() => useUserStatistics("007"));
    const options = mocks.useQuery.mock.calls[0][0];

    expect(options.queryKey).toEqual(["statisticsByUserId", "7"]);
    expect(options.enabled).toBe(true);
    await expect(options.queryFn()).resolves.toEqual({ bidCount: 4 });
    expect(mocks.get).toHaveBeenCalledWith("/statistics/statisticsByUserId/7");
  });

  it.each([undefined, "", "0", "-2", "NaN"])(
    "disables account statistics for invalid identifier %j",
    (userId) => {
      renderHook(() => useUserStatistics(userId));
      const options = mocks.useQuery.mock.calls[0][0];

      expect(options.queryKey).toEqual(["statisticsByUserId", ""]);
      expect(options.enabled).toBe(false);
      expect(mocks.get).not.toHaveBeenCalled();
    },
  );
});
