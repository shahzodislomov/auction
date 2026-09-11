import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { normalizeCounterparty, useUserById } from "./useUserById";

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: apiMocks,
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("auction sale user lookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a seller by id through the backend query contract", async () => {
    apiMocks.get.mockResolvedValue({
      data: { data: { userId: 200, firstName: "Ali", lastName: "Valiyev", phoneNumber: "+998901112233" } },
    });

    const { result } = renderHook(() => useUserById("200"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiMocks.get).toHaveBeenCalledWith("/user/getUserById", {
      params: { id: "200" },
    });
    expect(normalizeCounterparty(result.current.data, "200")).toEqual({
      id: "200",
      label: "Ali Valiyev",
      phone: "+998901112233",
    });
  });
});
