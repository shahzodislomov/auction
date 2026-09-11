"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useCreateLotAttribute,
  useDeleteAttr,
  useTieAttribute,
} from "@/queries/attributes";
import { useLotTypes } from "@/queries/lot-types";
import { useCreateSubType, useSubByType } from "@/queries/subtypes";

const apiSpies = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: apiSpies,
}));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("reference-data query contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiSpies.delete.mockResolvedValue({ data: { status: "OK" } });
    apiSpies.post.mockResolvedValue({ data: { status: "OK" } });
  });

  it("keeps paginated lot-type results in distinct caches", async () => {
    apiSpies.get.mockImplementation(
      (_url: string, config?: { params?: { page?: number } }) =>
        Promise.resolve({
          data: {
            data: {
              dtoList: [{ id: config?.params?.page, name: `Page ${config?.params?.page}` }],
            },
          },
        }),
    );
    const queryClient = createQueryClient();
    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useLotTypes(page, 1),
      { initialProps: { page: 0 }, wrapper: createWrapper(queryClient) },
    );

    await waitFor(() =>
      expect(
        (result.current.data as Array<{ name: string }> | undefined)?.[0]?.name,
      ).toBe("Page 0"),
    );
    rerender({ page: 1 });
    await waitFor(() =>
      expect(
        (result.current.data as Array<{ name: string }> | undefined)?.[0]?.name,
      ).toBe("Page 1"),
    );

    expect(queryClient.getQueryData(["allLotTypes", 0, 1])).toEqual([
      { id: 0, name: "Page 0" },
    ]);
    expect(queryClient.getQueryData(["allLotTypes", 1, 1])).toEqual([
      { id: 1, name: "Page 1" },
    ]);
  });

  it("keeps subtype-by-type results scoped to the selected lot type", async () => {
    apiSpies.get.mockImplementation((url: string) =>
      Promise.resolve({
        data: {
          data: [{ id: url.endsWith("/1") ? 11 : 22, name: url }],
        },
      }),
    );
    const queryClient = createQueryClient();
    const { result, rerender } = renderHook(
      ({ lotTypeId }: { lotTypeId: number }) => useSubByType(lotTypeId),
      { initialProps: { lotTypeId: 1 }, wrapper: createWrapper(queryClient) },
    );

    await waitFor(() =>
      expect(
        (result.current.data as Array<{ id: number }> | undefined)?.[0]?.id,
      ).toBe(11),
    );
    rerender({ lotTypeId: 2 });
    await waitFor(() =>
      expect(
        (result.current.data as Array<{ id: number }> | undefined)?.[0]?.id,
      ).toBe(22),
    );

    expect(queryClient.getQueryData(["allSubByType", 1])).toEqual([
      { id: 11, name: "/subType/get/1" },
    ]);
    expect(queryClient.getQueryData(["allSubByType", 2])).toEqual([
      { id: 22, name: "/subType/get/2" },
    ]);
  });

  it("invalidates both aggregate and type-scoped subtype caches after creation", async () => {
    const queryClient = createQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateSubType(), {
      wrapper: createWrapper(queryClient),
    });
    const createSubtype = result.current as unknown as {
      mutateAsync: (variables: {
        lotTypeId: number;
        name: { en: string };
      }) => Promise<unknown>;
    };

    await act(async () => {
      await createSubtype.mutateAsync({ lotTypeId: 1, name: { en: "Sedan" } });
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allSub"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allSubByType"] });
  });

  it("refreshes available subtype attributes after creating or deleting an attribute", async () => {
    const queryClient = createQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result: createResult } = renderHook(() => useCreateLotAttribute(), {
      wrapper: createWrapper(queryClient),
    });
    const { result: deleteResult } = renderHook(() => useDeleteAttr(), {
      wrapper: createWrapper(queryClient),
    });
    const createAttribute = createResult.current as unknown as {
      mutateAsync: (variables: {
        isSelectable: boolean;
        name: { en: string };
        valueType: string;
      }) => Promise<unknown>;
    };
    const deleteAttribute = deleteResult.current as unknown as {
      mutateAsync: (id: string) => Promise<unknown>;
    };

    await act(async () => {
      await createAttribute.mutateAsync({
        isSelectable: false,
        name: { en: "Mileage" },
        valueType: "INTEGER",
      });
      await deleteAttribute.mutateAsync("3");
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["untiedAttr"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allAttrBySubtype"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["attrOptions"] });
  });

  it("uses the legacy toggle endpoint for both tie directions and requires explicit OK", async () => {
    const queryClient = createQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useTieAttribute(), {
      wrapper: createWrapper(queryClient),
    });
    const toggleAttribute = result.current as unknown as {
      mutateAsync: (variables: {
        attributeId: string;
        subTypeId: string;
      }) => Promise<unknown>;
    };

    await act(async () => {
      await toggleAttribute.mutateAsync({ attributeId: "3", subTypeId: "2" });
    });

    expect(apiSpies.post).toHaveBeenCalledWith(
      "/attribute/tieAttributeToSubtype/3/2",
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allAttrBySubtype"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["untiedAttr"] });

    apiSpies.post.mockResolvedValueOnce({ data: { status: "ERROR" } });
    await act(async () => {
      await expect(
        toggleAttribute.mutateAsync({ attributeId: "3", subTypeId: "2" }),
      ).rejects.toThrow(/did not confirm/i);
    });
  });
});
