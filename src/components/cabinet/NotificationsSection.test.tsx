import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LangSwitch } from "@/context/LangSwitch";

import { NotificationsSection } from "./CabinetLiveSections";

const notificationQuery = vi.hoisted(() => ({
  data: [
    {
      body: "Hujjatingiz administrator tomonidan tekshirilmoqda",
      createdAt: "2026-07-20T10:00:00Z",
      id: 44,
      isRead: false,
      title: "KYC tekshiruvi",
    },
  ] as Array<Record<string, unknown>>,
  isError: false,
  isLoading: false,
}));

vi.mock("@/queries/notifications", () => ({
  markNotifAsReadById: vi.fn().mockResolvedValue({}),
  markNotifAsRead: vi.fn().mockResolvedValue({}),
  useNotificationsByUserId: () => notificationQuery,
}));

vi.mock("@/hooks/useStomp", () => ({
  useSocket: () => ({
    connected: false,
    connectionState: "unavailable",
    publish: vi.fn(),
    subscribe: vi.fn(),
  }),
}));

describe("NotificationsSection", () => {
  beforeEach(() => {
    notificationQuery.data = [
      {
        body: "Hujjatingiz administrator tomonidan tekshirilmoqda",
        createdAt: "2026-07-20T10:00:00Z",
        id: 44,
        isRead: false,
        title: "KYC tekshiruvi",
      },
    ];
    notificationQuery.isError = false;
    notificationQuery.isLoading = false;
  });

  it("renders REST notifications even when the live socket is unavailable", () => {
    render(
      <LangSwitch.Provider value={{ currentLang: "uz", setCurrentLang: vi.fn() }}>
        <NotificationsSection userId={200} />
      </LangSwitch.Provider>,
    );

    expect(screen.getByRole("heading", { name: "KYC tekshiruvi" })).toBeVisible();
    expect(
      screen.getByText("Hujjatingiz administrator tomonidan tekshirilmoqda"),
    ).toBeVisible();
  });

  it("opens notification details with an auction start link", async () => {
    const user = userEvent.setup();
    notificationQuery.data = [
      {
        auctionId: 77,
        body: "Auksion boshlandi",
        createdAt: "2026-07-20T10:00:00Z",
        id: 45,
        isRead: false,
        notificationType: "AUCTION_STARTED",
        title: "Auksion boshlandi",
      },
    ];

    render(
      <LangSwitch.Provider value={{ currentLang: "uz", setCurrentLang: vi.fn() }}>
        <NotificationsSection userId={200} />
      </LangSwitch.Provider>,
    );

    await user.click(screen.getByRole("button", { name: /auksion boshlandi/i }));

    expect(screen.getByRole("dialog", { name: /auksion boshlandi/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /auksionni ko‘rish/i })).toHaveAttribute(
      "href",
      "/auctions/77/live",
    );
  });

  it("opens a linked unread notification automatically", async () => {
    render(
      <LangSwitch.Provider value={{ currentLang: "uz", setCurrentLang: vi.fn() }}>
        <NotificationsSection initialNotificationId="44" userId={200} />
      </LangSwitch.Provider>,
    );

    expect(await screen.findByRole("dialog", { name: /kyc tekshiruvi/i })).toBeVisible();
  });
});
