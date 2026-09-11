import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { LangSwitch } from "@/context/LangSwitch";

import { EmailAuthForm } from "./EmailAuthForm";
import { OtpStep } from "./OtpStep";

const authSpies = vi.hoisted(() => ({
  push: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  sendFcmToken: vi.fn(),
  loginPayload: vi.fn(),
  registerPayload: vi.fn(),
  verifyPayload: vi.fn(),
  resendPayload: vi.fn(),
  googleProps: vi.fn(),
  loginResponse: {
    code: 1,
    data: 41,
    message: "login-token",
  } as {
    code?: number;
    data?: string | number;
    message?: string;
    status?: string;
  },
  verifyLoginResponse: {
    message: "SUCCESS",
    data: { token: "verified-token" },
  } as {
    status?: string;
    message?: string;
    data?: { token?: string };
  },
  resendResponse: { status: "OK", message: "resent" } as {
    status?: string;
    message?: string;
  },
  registerResponse: { status: "OK", message: "sent", meta: { userId: 52 } } as {
    status?: string;
    message?: string;
    meta?: { userId?: string | number };
    data?: { token?: string; user?: { id?: string | number } };
  },
  resendError: null as Error | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: authSpies.push }),
}));

vi.mock("@/context/UserContext", () => ({
  useUserContext: () => ({
    login: authSpies.login,
    logout: authSpies.logout,
  }),
}));

vi.mock("@/queries/notifications", () => ({
  sendFcmToken: authSpies.sendFcmToken,
}));

vi.mock("@/app/(_components)/auth/GoogleLog", () => ({
  default: (props: { deviceId: string | null; returnTo?: string }) => {
    authSpies.googleProps(props);
    return <button type="button">Continue with Google</button>;
  },
}));

vi.mock("@/app/(_components)/auth/TelegramLog", () => ({
  default: (props: { deviceId: string | null; returnTo?: string }) => {
    return <button type="button">Continue with Telegram</button>;
  },
}));

vi.mock("@/queries/index", () => ({
  useLoginMutation: (onSuccess: (response: unknown) => void) => ({
    isPending: false,
    mutate: (payload: unknown) => {
      authSpies.loginPayload(payload);
      onSuccess(authSpies.loginResponse);
    },
  }),
  useRegisterMutation: (onSuccess: (response: unknown) => void) => ({
    isPending: false,
    mutate: (payload: unknown) => {
      authSpies.registerPayload(payload);
      onSuccess(authSpies.registerResponse);
    },
  }),
  useVerfMutation: (onSuccess: (response: unknown) => void) => ({
    isPending: false,
    mutate: (payload: unknown) => {
      authSpies.verifyPayload(payload);
      onSuccess({
        status: "OK",
        message: "verified",
        data: { token: "registration-token", user: { id: 52 } },
      });
    },
  }),
  useCheckCodeMutation: (onSuccess: (response: unknown) => void) => ({
    isPending: false,
    mutate: (payload: unknown) => {
      authSpies.verifyPayload(payload);
      onSuccess(authSpies.verifyLoginResponse);
    },
  }),
  useReVerfMutation: (
    onSuccess: (response: unknown) => void,
    onError: (error: unknown) => void,
  ) => ({
    isPending: false,
    mutate: (payload: unknown) => {
      authSpies.resendPayload(payload);
      if (authSpies.resendError) {
        onError(authSpies.resendError);
        return;
      }
      onSuccess(authSpies.resendResponse);
    },
  }),
}));

function renderInEnglish(ui: ReactElement) {
  return render(
    <LangSwitch.Provider
      value={{ currentLang: "en", setCurrentLang: vi.fn() }}
    >
      {ui}
    </LangSwitch.Provider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authSpies.resendResponse = { status: "OK", message: "resent" };
  authSpies.resendError = null;
  authSpies.loginResponse = {
    code: 1,
    data: 41,
    message: "login-token",
  };
  authSpies.verifyLoginResponse = {
    message: "SUCCESS",
    data: { token: "verified-token" },
  };
  authSpies.registerResponse = { status: "OK", message: "sent", meta: { userId: 52 } };
  authSpies.login.mockResolvedValue({ id: 41, firstname: "Buyer" });
  authSpies.logout.mockResolvedValue(undefined);
  authSpies.sendFcmToken.mockResolvedValue(undefined);
  window.localStorage.clear();
  window.localStorage.setItem("deviceId", "device-test");
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Champagne Ledger authentication", () => {
  test("labels email and password and returns to the requested task after login", async () => {
    const user = userEvent.setup();
    renderInEnglish(
      <EmailAuthForm mode="login" returnTo="/sell?resume=vehicle" />,
    );

    await user.type(screen.getByLabelText("Email address"), "seller@example.com");
    await user.type(screen.getByLabelText("Password"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(authSpies.loginPayload).toHaveBeenCalledWith({
      deviceId: "device-test",
      email: "seller@example.com",
      password: "strong-password",
    });
    await waitFor(() => expect(authSpies.login).toHaveBeenCalledWith("login-token"));
    expect(window.localStorage.getItem("userId")).toBe("41");
    expect(authSpies.push).toHaveBeenCalledWith("/sell?resume=vehicle");
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Continue with Telegram" })).toBeVisible();
    expect(authSpies.googleProps).toHaveBeenCalledWith({
      deviceId: "device-test",
      returnTo: "/sell?resume=vehicle",
    });
  });

  test("shows a profile-fetch failure instead of leaving an unhandled login", async () => {
    const user = userEvent.setup();
    authSpies.login.mockRejectedValueOnce(new Error("Profile unavailable"));
    renderInEnglish(
      <EmailAuthForm mode="login" returnTo="/dashboard/winning" />,
    );

    await user.type(screen.getByLabelText("Email address"), "buyer@example.com");
    await user.type(screen.getByLabelText("Password"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Profile unavailable",
    );
    expect(authSpies.push).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("userId")).toBeNull();
  });

  test("rejects an explicit failed direct-login response even when legacy fields look successful", async () => {
    const user = userEvent.setup();
    authSpies.loginResponse = {
      status: "ERROR",
      code: 1,
      data: 41,
      message: "still-valid-or-stale-token",
    };
    renderInEnglish(<EmailAuthForm mode="login" returnTo="/dashboard" />);

    await user.type(screen.getByLabelText("Email address"), "buyer@example.com");
    await user.type(screen.getByLabelText("Password"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "still-valid-or-stale-token",
    );
    expect(authSpies.login).not.toHaveBeenCalled();
    expect(authSpies.push).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("userId")).toBeNull();
  });

  test("rejects an explicit failed OTP response even when it says SUCCESS and carries a token", async () => {
    const user = userEvent.setup();
    authSpies.loginResponse = {
      status: "OK",
      code: 0,
      data: 41,
      message: "verification-required",
    };
    authSpies.verifyLoginResponse = {
      status: "ERROR",
      message: "SUCCESS",
      data: { token: "stale-verified-token" },
    };
    renderInEnglish(<EmailAuthForm mode="login" returnTo="/dashboard" />);

    await user.type(screen.getByLabelText("Email address"), "buyer@example.com");
    await user.type(screen.getByLabelText("Password"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    const otpInputs = await screen.findAllByLabelText(/verification digit/i);
    fireEvent.paste(otpInputs[0], {
      clipboardData: { getData: () => "12345" },
    });
    await user.click(screen.getByRole("button", { name: "Verify code" }));

    expect(authSpies.verifyPayload).toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /verification code was not accepted/i,
    );
    expect(authSpies.login).not.toHaveBeenCalled();
    expect(authSpies.push).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("userId")).toBeNull();
  });

  test("rejects a login response whose supplied account id differs from the token profile", async () => {
    const user = userEvent.setup();
    authSpies.loginResponse = {
      status: "OK",
      code: 1,
      data: 99,
      message: "login-token",
    };
    authSpies.login.mockResolvedValueOnce({ id: 41, firstname: "Buyer" });
    window.localStorage.setItem("fcmToken", "push-token");
    renderInEnglish(<EmailAuthForm mode="login" returnTo="/dashboard" />);

    await user.type(screen.getByLabelText("Email address"), "buyer@example.com");
    await user.type(screen.getByLabelText("Password"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/login failed/i);
    expect(authSpies.login).toHaveBeenCalledWith("login-token");
    expect(authSpies.logout).toHaveBeenCalledOnce();
    expect(authSpies.sendFcmToken).not.toHaveBeenCalled();
    expect(authSpies.push).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("userId")).toBeNull();
  });

  test.each([
    "//attacker.example/auction",
    "/\\attacker.example/auction",
    "/safe/..//attacker.example/auction",
  ])("sanitizes an unsafe login return destination: %s", (returnTo) => {
    renderInEnglish(
      <EmailAuthForm mode="login" returnTo={returnTo} />,
    );

    expect(screen.getByRole("link", { name: "Reset it" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(authSpies.googleProps).toHaveBeenCalledWith({
      deviceId: "device-test",
      returnTo: "/",
    });
  });

  test("preserves the sanitized task across login, registration, and recovery", () => {
    const { rerender } = renderInEnglish(
      <EmailAuthForm mode="login" returnTo="/sell?resume=vehicle" />,
    );

    expect(screen.getByRole("link", { name: "Reset it" })).toHaveAttribute(
      "href",
      "/forgot-password?returnTo=%2Fsell%3Fresume%3Dvehicle",
    );
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      "/register?returnTo=%2Fsell%3Fresume%3Dvehicle",
    );

    rerender(
      <LangSwitch.Provider
        value={{ currentLang: "en", setCurrentLang: vi.fn() }}
      >
        <EmailAuthForm mode="register" returnTo="/sell?resume=vehicle" />
      </LangSwitch.Provider>,
    );

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fsell%3Fresume%3Dvehicle",
    );
  });

  test("submits email registration with an automatic device id", async () => {
    const user = userEvent.setup();
    renderInEnglish(<EmailAuthForm mode="register" />);

    await user.type(screen.getByLabelText("First name"), "Ali");
    await user.type(screen.getByLabelText("Last name"), "Valiyev");
    await user.type(screen.getByRole("textbox", { name: "Email address" }), "ali@example.com");
    await user.type(screen.getByLabelText("Password"), "strong-password");
    await user.type(screen.getByLabelText("Confirm password"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(authSpies.registerPayload).toHaveBeenCalledWith({
      channel: "email",
      deviceId: "device-test",
      email: "ali@example.com",
      firstname: "Ali",
      lastname: "Valiyev",
      password: "strong-password",
    });
    expect(await screen.findByText(/enter the five-digit code/i)).toBeVisible();
  });

  test("logs in and opens the dashboard when registration returns a token", async () => {
    const user = userEvent.setup();
    authSpies.registerResponse = {
      message: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1MiJ9.signature",
    };
    authSpies.login.mockResolvedValueOnce({ id: 52, firstname: "Ali" });
    renderInEnglish(<EmailAuthForm mode="register" />);

    await user.type(screen.getByLabelText("First name"), "Ali");
    await user.type(screen.getByLabelText("Last name"), "Valiyev");
    await user.type(screen.getByRole("textbox", { name: "Email address" }), "ali@example.com");
    await user.type(screen.getByLabelText("Password"), "strong-password");
    await user.type(screen.getByLabelText("Confirm password"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(authSpies.login).toHaveBeenCalledWith(
        "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1MiJ9.signature",
      ),
    );
    expect(authSpies.push).toHaveBeenCalledWith("/dashboard");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("submits phone registration with only phone, password, and automatic device id", async () => {
    const user = userEvent.setup();
    renderInEnglish(<EmailAuthForm mode="register" />);

    await user.click(screen.getByRole("radio", { name: "Register by phone" }));
    await user.type(screen.getByRole("textbox", { name: "Phone number" }), "901234567");
    await user.type(screen.getByLabelText("Password"), "strong-password");
    await user.type(screen.getByLabelText("Confirm password"), "strong-password");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(authSpies.registerPayload).toHaveBeenCalledWith({
      channel: "phone",
      deviceId: "device-test",
      password: "strong-password",
      phone: "901234567",
    });
  });

  test("accepts a pasted five-digit OTP and enables resend after the timer", async () => {
    vi.useFakeTimers();
    const onVerify = vi.fn();
    const onResend = vi.fn();
    renderInEnglish(
      <OtpStep
        completedContent={<input aria-label="New password" />}
        email="seller@example.com"
        onResend={onResend}
        onVerify={onVerify}
        resendAfterSeconds={2}
      />,
    );

    const inputs = screen.getAllByLabelText(/verification digit/i);
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify code" })).toBeDisabled();
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => "12345" },
    });

    expect(inputs).toHaveLength(5);
    expect(inputs.map((input) => (input as HTMLInputElement).value)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
    expect(screen.getByLabelText("New password")).toBeVisible();
    expect(screen.getByRole("button", { name: "Verify code" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Verify code" }));
    expect(onVerify).toHaveBeenCalledWith("12345");

    const resend = screen.getByRole("button", { name: /resend code/i });
    expect(resend).toBeDisabled();
    act(() => vi.advanceTimersByTime(2_000));
    expect(resend).toBeEnabled();
    fireEvent.click(resend);
    expect(onResend).toHaveBeenCalledOnce();
  });

});
