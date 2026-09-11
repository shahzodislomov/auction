"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAttrOptions } from "@/queries/attributes";

const apiSpies = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/api/api", () => ({ api: { get: apiSpies.get } }));

describe("useAttrOptions account-safe cache keys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiSpies.get.mockImplementation((url: string) =>
      Promise.resolve({
        data: {
          data: url.endsWith("/1")
            ? [{ id: 11, value: { en: "Blue" } }]
            : [{ id: 22, value: { en: "Automatic" } }],
        },
      }),
    );
  });

  it("fetches a separate fresh option list when the selected attribute changes", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result, rerender } = renderHook(
      ({ id }: { id: number }) => useAttrOptions(id),
      { initialProps: { id: 1 }, wrapper },
    );

    await waitFor(() => expect(result.current.data).toEqual([{ id: 11, value: { en: "Blue" } }]));
    rerender({ id: 2 });
    await waitFor(() => expect(result.current.data).toEqual([{ id: 22, value: { en: "Automatic" } }]));

    expect(apiSpies.get).toHaveBeenCalledWith(
      "/attribute/getSelectableAttributeValues/1",
    );
    expect(apiSpies.get).toHaveBeenCalledWith(
      "/attribute/getSelectableAttributeValues/2",
    );
  });
});
