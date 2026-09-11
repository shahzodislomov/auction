import { IntlProvider } from "react-intl";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TelegramLoginButton from "./TelegramLog";

const telegramSpies = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  post: vi.fn(),
  push: vi.fn(),
  sendFcmToken: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: { post: telegramSpies.post },
}));

vi.mock("@/context/UserContext", () => ({
  useUserContext: () => ({
    login: telegramSpies.login,
    logout: telegramSpies.logout,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: telegramSpies.push }),
}));

vi.mock("react-toastify", () => ({
  toast: { success: telegramSpies.toastSuccess },
}));

vi.mock("@/queries/notifications", () => ({
  sendFcmToken: telegramSpies.sendFcmToken,
}));

describe("TelegramLoginButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID = "8885467089";
    window.Telegram = {
      Login: {
        auth: vi.fn((opts, cb) => cb({ id: 88, first_name: "TelegramUser", hash: "mockhash" })),
      },
    };
    telegramSpies.post.mockResolvedValue({
      data: { status: "OK", token: "tg-session-token", data: 88 },
    });
    telegramSpies.login.mockResolvedValue({ id: 88, firstname: "TelegramUser" });
    telegramSpies.logout.mockResolvedValue(undefined);
    telegramSpies.sendFcmToken.mockResolvedValue(undefined);
  });

  it("authenticates with Telegram and navigates to returnTo path", async () => {
    const user = userEvent.setup();
    render(
      <IntlProvider locale="en" messages={{ success: "Success!", withTelegram: "Continue with Telegram" }}>
        <TelegramLoginButton deviceId="device-test-tg" returnTo="/auctions/402" />
      </IntlProvider>,
    );

    const button = screen.getByRole("button", { name: "Continue with Telegram" });
    await user.click(button);

    await waitFor(() => {
      expect(telegramSpies.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/telegram"),
        expect.any(Object)
      );
      expect(telegramSpies.login).toHaveBeenCalledWith("tg-session-token");
      expect(telegramSpies.push).toHaveBeenCalledWith("/auctions/402");
    });
  });

  it("disables button and toggles aria-busy during request", async () => {
    const user = userEvent.setup();
    let resolvePost;
    telegramSpies.post.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );

    render(
      <IntlProvider locale="en" messages={{ success: "Success!", withTelegram: "Continue with Telegram" }}>
        <TelegramLoginButton deviceId="device-test" />
      </IntlProvider>,
    );

    const button = screen.getByRole("button", { name: "Continue with Telegram" });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "false");

    await user.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    resolvePost({ data: { status: "OK", token: "tg-session-token", data: 88 } });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("handles authentication failures gracefully with alert message", async () => {
    const user = userEvent.setup();
    telegramSpies.post.mockRejectedValueOnce(new Error("popup-closed"));

    render(
      <IntlProvider locale="en" messages={{ withTelegram: "Continue with Telegram" }}>
        <TelegramLoginButton deviceId="device-test" />
      </IntlProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Continue with Telegram" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
