"use client";

import { describe, expect, it, vi } from "vitest";

import { useRegisterMutation } from "./index";

const queryMocks = vi.hoisted(() => ({
  post: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useMutation: queryMocks.useMutation,
  };
});

vi.mock("@/api/api", () => ({
  api: { post: queryMocks.post },
}));

describe("useRegisterMutation", () => {
  it("posts email registrations to the email endpoint", async () => {
    queryMocks.post.mockResolvedValueOnce({ data: { status: "OK" } });
    queryMocks.useMutation.mockImplementationOnce((options) => options);

    const options = useRegisterMutation(vi.fn(), vi.fn()) as unknown as {
      mutationFn: (payload: unknown) => Promise<unknown>;
    };

    await options.mutationFn({
      channel: "email",
      deviceId: "device-1",
      email: "ali@example.com",
      firstname: "Ali",
      lastname: "Valiyev",
      password: "strong-password",
    });

    expect(queryMocks.post).toHaveBeenCalledWith(
      "/auth/registerByEmail",
      {
        deviceId: "device-1",
        email: "ali@example.com",
        firstname: "Ali",
        lastname: "Valiyev",
        password: "strong-password",
        language: "uz",
      },
    );
  });

  it("posts phone registrations to the phone endpoint", async () => {
    queryMocks.post.mockResolvedValueOnce({ data: { status: "OK" } });
    queryMocks.useMutation.mockImplementationOnce((options) => options);

    const options = useRegisterMutation(vi.fn(), vi.fn()) as unknown as {
      mutationFn: (payload: unknown) => Promise<unknown>;
    };

    await options.mutationFn({
      channel: "phone",
      deviceId: "device-1",
      password: "strong-password",
      phone: "901234567",
    });

    expect(queryMocks.post).toHaveBeenCalledWith(
      "/auth/registerByPhone",
      {
        deviceId: "device-1",
        password: "strong-password",
        phone: "901234567",
      },
      {
        params: {
          deviceId: "device-1",
          password: "strong-password",
          phone: "901234567",
        },
      },
    );
  });
});
