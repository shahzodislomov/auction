import { IntlProvider } from "react-intl";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LangSwitch } from "@/context/LangSwitch";

import GoogleLoginButton from "./GoogleLog";

const googleSpies = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  post: vi.fn(),
  push: vi.fn(),
  sendFcmToken: vi.fn(),
  signInWithPopup: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  signInWithPopup: googleSpies.signInWithPopup,
}));

vi.mock("@/api/api", () => ({
  api: { post: googleSpies.post },
}));

vi.mock("@/context/UserContext", () => ({
  useUserContext: () => ({
    login: googleSpies.login,
    logout: googleSpies.logout,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: googleSpies.push }),
}));

vi.mock("react-toastify", () => ({
  toast: { success: googleSpies.toastSuccess },
}));

vi.mock("@/queries/notifications", () => ({
  sendFcmToken: googleSpies.sendFcmToken,
}));

describe("GoogleLoginButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    googleSpies.signInWithPopup.mockResolvedValue({
      user: { getIdToken: vi.fn().mockResolvedValue("firebase-token") },
    });
    googleSpies.post.mockResolvedValue({
      data: { status: "OK", token: "session-token", data: 41 },
    });
    googleSpies.login.mockResolvedValue({ id: 41, firstname: "Buyer" });
    googleSpies.logout.mockResolvedValue(undefined);
    googleSpies.sendFcmToken.mockResolvedValue(undefined);
  });

  it("returns to the sanitized task after Google login", async () => {
    const user = userEvent.setup();
    render(
      <IntlProvider locale="en" messages={{ success: "Success!", withGoogle: "Continue with Google" }}>
        <GoogleLoginButton deviceId="device-test" returnTo="/auctions/301" />
      </IntlProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    await waitFor(() => {
      expect(googleSpies.login).toHaveBeenCalledWith("session-token");
      expect(googleSpies.push).toHaveBeenCalledWith("/auctions/301");
    });
  });

  it("disables button and sets aria-busy during authentication request", async () => {
    const user = userEvent.setup();
    let resolvePopup;
    googleSpies.signInWithPopup.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePopup = resolve;
      }),
    );

    render(
      <IntlProvider locale="en" messages={{ success: "Success!", withGoogle: "Continue with Google" }}>
        <GoogleLoginButton deviceId="device-test" />
      </IntlProvider>,
    );

    const button = screen.getByRole("button", { name: "Continue with Google" });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "false");

    await user.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    resolvePopup({
      user: { getIdToken: vi.fn().mockResolvedValue("firebase-token") },
    });

    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it("rejects a backslash-based external return after Google login", async () => {
    const user = userEvent.setup();
    render(
      <IntlProvider locale="en" messages={{ success: "Success!", withGoogle: "Continue with Google" }}>
        <GoogleLoginButton deviceId="device-test" returnTo="/\\evil.example" />
      </IntlProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    await waitFor(() => expect(googleSpies.push).toHaveBeenCalledWith("/"));
  });

  it("announces a localized authentication failure", async () => {
    const user = userEvent.setup();
    googleSpies.signInWithPopup.mockRejectedValueOnce(new Error("popup closed"));

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <IntlProvider locale="en" messages={{ success: "Success!", withGoogle: "Continue with Google" }}>
          <GoogleLoginButton deviceId="device-test" />
        </IntlProvider>
      </LangSwitch.Provider>,
    );

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Login failed. Check the email and password, then try again.",
    );
  });

  it("rejects an OK response without a usable token and account id", async () => {
    const user = userEvent.setup();
    googleSpies.post.mockResolvedValueOnce({
      data: { status: "OK", token: "", data: undefined },
    });

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <IntlProvider locale="en" messages={{ success: "Success!", withGoogle: "Continue with Google" }}>
          <GoogleLoginButton deviceId="device-test" returnTo="/cabinet" />
        </IntlProvider>
      </LangSwitch.Provider>,
    );

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Login failed. Check the email and password, then try again.",
    );
    expect(googleSpies.login).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("userId")).toBeNull();
    expect(googleSpies.toastSuccess).not.toHaveBeenCalled();
    expect(googleSpies.push).not.toHaveBeenCalled();
  });

  it("rejects a backend account id that differs from the token profile", async () => {
    const user = userEvent.setup();
    googleSpies.post.mockResolvedValueOnce({
      data: { status: "OK", token: "session-token", data: 99 },
    });
    googleSpies.login.mockResolvedValueOnce({ id: 41, firstname: "Buyer" });
    window.localStorage.setItem("fcmToken", "push-token");

    render(
      <LangSwitch.Provider value={{ currentLang: "en", setCurrentLang: vi.fn() }}>
        <IntlProvider locale="en" messages={{ success: "Success!", withGoogle: "Continue with Google" }}>
          <GoogleLoginButton deviceId="device-test" returnTo="/dashboard" />
        </IntlProvider>
      </LangSwitch.Provider>,
    );

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/login failed/i);
    expect(googleSpies.logout).toHaveBeenCalledOnce();
    expect(googleSpies.sendFcmToken).not.toHaveBeenCalled();
    expect(googleSpies.toastSuccess).not.toHaveBeenCalled();
    expect(googleSpies.push).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("userId")).toBeNull();
  });

  it("announces and toasts a localized success", async () => {
    const user = userEvent.setup();
    render(
      <IntlProvider locale="en" messages={{ success: "Success!", withGoogle: "Continue with Google" }}>
        <GoogleLoginButton deviceId="device-test" />
      </IntlProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Success!");
    expect(googleSpies.toastSuccess).toHaveBeenCalledWith("Success!");
  });

  it("keeps authentication successful when optional notification registration fails", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("fcmToken", "push-token");
    googleSpies.sendFcmToken.mockRejectedValueOnce(new Error("push unavailable"));

    render(
      <IntlProvider locale="en" messages={{ success: "Success!", withGoogle: "Continue with Google" }}>
        <GoogleLoginButton deviceId="device-test" returnTo="/cabinet" />
      </IntlProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    await waitFor(() => expect(googleSpies.push).toHaveBeenCalledWith("/cabinet"));
    expect(await screen.findByRole("status")).toHaveTextContent("Success!");
  });
});
