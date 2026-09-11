"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUserDocumentUpload } from "./users";

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: {},
  fileSend: { post: mocks.post },
}));

vi.mock("@/context/UserContext", () => ({
  useUserContext: () => ({ refetch: vi.fn() }),
}));

describe("useUserDocumentUpload", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  it("accepts the backend CREATED response and invalidates the current user", async () => {
    mocks.post.mockResolvedValue({
      data: {
        data: { docType: "PASSPORT", documentId: 6, userId: 200 },
        message: "Document uploaded",
        status: "CREATED",
      },
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUserDocumentUpload(), {
      wrapper: Wrapper,
    });
    const file = new File(["passport"], "passport.jpg", {
      type: "image/jpeg",
    });

    await act(async () => {
      await result.current.mutateAsync({ docType: "PASSPORT", file });
    });

    expect(mocks.post).toHaveBeenCalledWith(
      "/user-documents/upload-file",
      expect.any(FormData),
      { params: { docType: "PASSPORT" } },
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["currentUser"] });
  });

  it("still rejects an explicit backend error response", async () => {
    mocks.post.mockResolvedValue({
      data: { message: "Upload failed", status: "ERROR" },
    });
    const { result } = renderHook(() => useUserDocumentUpload(), {
      wrapper: Wrapper,
    });
    const file = new File(["passport"], "passport.jpg", {
      type: "image/jpeg",
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ docType: "PASSPORT", file }),
      ).rejects.toThrow(/did not confirm/i);
    });
  });
});
