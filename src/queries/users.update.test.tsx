"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useAddRole,
  useBlockUserMutation,
  useDeleteRole,
  useUpdateEmail,
  useUpdateEmailVerify,
  useUpdatePasswordVerify,
  useUpdatePasswordWithOld,
  useUpdateUser,
} from "./users";

const mocks = vi.hoisted(() => ({
  delete: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: { delete: mocks.delete, post: mocks.post, put: mocks.put },
}));

vi.mock("@/context/UserContext", () => ({
  useUserContext: () => ({ refetch: mocks.refetch }),
}));

function executeMutation(
  mutation: { mutateAsync: unknown },
  variables: unknown,
) {
  return (mutation.mutateAsync as (payload: unknown) => Promise<unknown>)(variables);
}

describe("connected user mutations", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.put.mockResolvedValue({ data: { status: "OK" } });
    mocks.post.mockResolvedValue({ data: { status: "OK" } });
    mocks.delete.mockResolvedValue({ data: { status: "OK" } });
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  it("updates the profile through a real TanStack mutation and refreshes the identity", async () => {
    const { result } = renderHook(() => useUpdateUser(), { wrapper: Wrapper });
    const payload = { id: 8, firstname: "Updated", lastname: "Buyer" };

    await act(async () => {
      await executeMutation(result.current, payload);
    });

    expect(mocks.put).toHaveBeenCalledWith("/user/updateUser", { firstname: "Updated", lastname: "Buyer" });
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });

  it("executes both request and verification hooks for email and password changes", async () => {
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(
      () => ({
        requestEmail: useUpdateEmail(),
        requestPassword: useUpdatePasswordWithOld(),
        verifyEmail: useUpdateEmailVerify(),
        verifyPassword: useUpdatePasswordVerify(),
      }),
      { wrapper: Wrapper },
    );

    await act(async () => {
      await executeMutation(result.current.requestEmail, {
        email: "old@example.uz",
        newEmail: "new@example.uz",
      });
      await executeMutation(result.current.verifyEmail, {
        email: "old@example.uz",
        newEmail: "new@example.uz",
        code: "123456",
      });
      await executeMutation(result.current.requestPassword, {
        email: "new@example.uz",
        newPassword: "new-password",
        oldPassword: "old-password",
      });
      await executeMutation(result.current.verifyPassword, {
        email: "new@example.uz",
        password: "new-password",
        code: "654321",
      });
    });

    expect(mocks.put).toHaveBeenCalledWith("/user/updateEmail", null, {
      params: { email: "old@example.uz", newEmail: "new@example.uz" },
    });
    expect(mocks.put).toHaveBeenCalledWith("/user/checkUpdatedEmail", null, {
      params: {
        email: "old@example.uz",
        newEmail: "new@example.uz",
        code: "123456",
      },
    });
    expect(mocks.put).toHaveBeenCalledWith("/user/updatePasswordWithOldPassword", null, {
      params: {
        email: "new@example.uz",
        newPassword: "new-password",
        oldPassword: "old-password",
      },
    });
    expect(mocks.post).toHaveBeenCalledWith("/user/checkUpdatedPassword", null, {
      params: { email: "new@example.uz", password: "new-password", code: "654321" },
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["currentUser"] });
    expect(mocks.refetch).toHaveBeenCalledTimes(2);
  });

  it("rejects ERROR and malformed password responses before UI success callbacks", async () => {
    const { result } = renderHook(
      () => ({
        requestPassword: useUpdatePasswordWithOld(),
        verifyPassword: useUpdatePasswordVerify(),
      }),
      { wrapper: Wrapper },
    );
    mocks.put.mockResolvedValueOnce({ data: { status: "ERROR" } });
    mocks.post.mockResolvedValueOnce({ data: { message: "verified" } });

    await act(async () => {
      await expect(executeMutation(result.current.requestPassword, {
        email: "buyer@example.uz",
        newPassword: "new-password",
        oldPassword: "old-password",
      })).rejects.toThrow(/did not confirm/i);
      await expect(executeMutation(result.current.verifyPassword, {
        email: "buyer@example.uz",
        password: "new-password",
        code: "654321",
      })).rejects.toThrow(/did not confirm/i);
    });
  });

  it("runs role replacement endpoints and rejects unconfirmed role changes", async () => {
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(
      () => ({ addRole: useAddRole(), deleteRole: useDeleteRole() }),
      { wrapper: Wrapper },
    );

    await act(async () => {
      await executeMutation(result.current.deleteRole, { roleIds: [7], userId: "7" });
    });

    expect(mocks.delete).toHaveBeenCalledWith("/user/deleteRoleFromUsers", {
      params: { roleIds: [7], userId: "7" },
      paramsSerializer: { indexes: null },
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["currentUser"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allUsers"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["user", "7"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["statisticsByUserId"] });

    invalidate.mockClear();
    await act(async () => {
      await executeMutation(result.current.addRole, { roleIds: [11], userId: "7" });
    });
    expect(mocks.post).toHaveBeenCalledWith("/user/addRoleToUser", null, {
      params: { roleIds: [11], userId: "7" },
      paramsSerializer: { indexes: null },
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["currentUser"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["allUsers"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["user", "7"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["statisticsByUserId"] });

    invalidate.mockClear();
    mocks.delete.mockResolvedValueOnce({ data: { message: "deleted" } });
    await act(async () => {
      await expect(executeMutation(result.current.deleteRole, {
        roleIds: [7],
        userId: "7",
      })).rejects.toThrow(/did not confirm/i);
    });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("invalidates active identity and user truth after a confirmed block", async () => {
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useBlockUserMutation(), { wrapper: Wrapper });

    await act(async () => {
      await executeMutation(result.current, 7);
    });

    expect(mocks.put).toHaveBeenCalledWith("/user/block/7");
    expect(invalidate.mock.calls.map(([filters]) => filters)).toEqual(
      expect.arrayContaining([
        { queryKey: ["allUsers"] },
        { queryKey: ["user", 7] },
        { queryKey: ["user", "7"] },
        { queryKey: ["statisticsByUserId"] },
        { queryKey: ["currentUser"] },
      ]),
    );

    invalidate.mockClear();
    mocks.put.mockResolvedValueOnce({ data: { status: "ERROR" } });
    await act(async () => {
      await expect(executeMutation(result.current, 7)).rejects.toThrow(/did not confirm/i);
    });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
