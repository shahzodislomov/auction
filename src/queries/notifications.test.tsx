import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchNotificationsByUserId } from "./notifications";

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: apiMocks,
}));

describe("notification endpoint adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a user's notifications from the REST endpoint", async () => {
    const notifications = [
      {
        body: "Hujjatingiz administrator tomonidan tekshirilmoqda",
        createdAt: "2026-07-20T10:00:00Z",
        id: 44,
        isRead: false,
        title: "KYC tekshiruvi",
      },
    ];
    apiMocks.get.mockResolvedValue({
      data: { data: notifications, message: "OK", status: "OK" },
    });

    await expect(fetchNotificationsByUserId("200")).resolves.toEqual(
      notifications,
    );
    expect(apiMocks.get).toHaveBeenCalledWith(
      "/notification/getAllNotifications/200",
    );
  });

  it("supports list payloads nested under data.content", async () => {
    apiMocks.get.mockResolvedValue({
      data: { data: { content: [{ id: 45, title: "Auction update" }] } },
    });

    await expect(fetchNotificationsByUserId(200)).resolves.toEqual([
      { id: 45, title: "Auction update" },
    ]);
  });
});
