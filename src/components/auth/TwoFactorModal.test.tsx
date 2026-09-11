import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TwoFactorModal } from "./TwoFactorModal";
import { LangSwitch } from "@/context/LangSwitch";

const mockSetupMutate = vi.fn();
const mockVerifyMutate = vi.fn();

vi.mock("@/queries/auth2fa", () => ({
  useSetupTwoFactor: () => ({
    mutate: mockSetupMutate,
    isPending: false,
    isError: false,
    data: {
      secret: "JBSWY3DPEHPK3PXP",
      qrCodeUrl: "https://example.com/qr.png",
    },
  }),
  useVerifyTwoFactor: () => ({
    mutate: mockVerifyMutate,
    isPending: false,
  }),
}));

describe("TwoFactorModal", () => {
  it("renders QR code, secret key, and input when opened", async () => {
    render(
      <LangSwitch.Provider
        value={{ currentLang: "ru", setCurrentLang: () => {} }}
      >
        <TwoFactorModal open={true} onClose={() => {}} />
      </LangSwitch.Provider>,
    );

    expect(
      screen.getByText("Подключение Google Authenticator (2FA)"),
    ).toBeInTheDocument();
    expect(screen.getByText("JBSWY3DPEHPK3PXP")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("000000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Подтвердить и включить" })).toBeInTheDocument();
  });

  it("allows entering 6-digit code and calls verify", async () => {
    const user = userEvent.setup();
    render(
      <LangSwitch.Provider
        value={{ currentLang: "ru", setCurrentLang: () => {} }}
      >
        <TwoFactorModal open={true} onClose={() => {}} />
      </LangSwitch.Provider>,
    );

    const input = screen.getByPlaceholderText("000000");
    await user.type(input, "123456");
    expect(input).toHaveValue("123456");

    const submitBtn = screen.getByRole("button", { name: "Подтвердить и включить" });
    await user.click(submitBtn);

    expect(mockVerifyMutate).toHaveBeenCalledWith(
      { code: "123456" },
      expect.any(Object),
    );
  });
});
