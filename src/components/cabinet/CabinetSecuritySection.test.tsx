import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CabinetSecuritySection } from "./CabinetSecuritySection";
import { LangSwitch } from "@/context/LangSwitch";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockRevokeOthers = vi.fn();
const mockRevokeSingle = vi.fn();

vi.mock("@/queries/auth2fa", () => ({
  useSetupTwoFactor: () => ({
    mutate: vi.fn(),
    isPending: false,
    data: null,
  }),
  useVerifyTwoFactor: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const QueryTestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  QueryTestWrapper.displayName = "QueryTestWrapper";
  return QueryTestWrapper;
};

vi.mock("@/queries/authSessions", () => ({
  useAuthSessions: () => ({
    data: [
      {
        id: "sess-1",
        deviceName: "Chrome on Windows",
        ip: "192.168.1.1",
        current: true,
      },
      {
        id: "sess-2",
        deviceName: "Safari on iPhone",
        ip: "192.168.1.2",
        current: false,
      },
    ],
    isLoading: false,
    error: null,
  }),
  useRevokeAuthSession: () => ({
    mutate: mockRevokeSingle,
    isPending: false,
  }),
  useRevokeOtherAuthSessions: () => ({
    mutate: mockRevokeOthers,
    isPending: false,
  }),
}));

describe("CabinetSecuritySection", () => {
  it("renders 2FA button and list of active sessions", () => {
    render(
      <LangSwitch.Provider
        value={{ currentLang: "ru", setCurrentLang: () => {} }}
      >
        <CabinetSecuritySection />
      </LangSwitch.Provider>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Безопасность и сессии")).toBeInTheDocument();
    expect(screen.getByText("Подключить 2FA")).toBeInTheDocument();
    expect(screen.getByText("Chrome on Windows")).toBeInTheDocument();
    expect(screen.getByText("Текущее устройство")).toBeInTheDocument();
    expect(screen.getByText("Safari on iPhone")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Выйти со всех других устройств" }),
    ).toBeInTheDocument();
  });

  it("calls revokeOthers mutation when clicking button", async () => {
    const user = userEvent.setup();
    render(
      <LangSwitch.Provider
        value={{ currentLang: "ru", setCurrentLang: () => {} }}
      >
        <CabinetSecuritySection />
      </LangSwitch.Provider>,
      { wrapper: createWrapper() },
    );

    const btn = screen.getByRole("button", {
      name: "Выйти со всех других устройств",
    });
    await user.click(btn);
    expect(mockRevokeOthers).toHaveBeenCalled();
  });
});
