import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithAppProviders } from "@/test/render";

import SupportPage from "./page";

const supportState = vi.hoisted(() => ({
  post: vi.fn(),
  user: { id: 7 } as { id?: string | number } | null,
}));

vi.mock("@/api/api", () => ({ api: { post: supportState.post } }));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => ({
    isAuthenticated: Boolean(supportState.user),
    user: supportState.user,
  }),
}));

describe("SupportPage response truthfulness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    supportState.user = { id: 7 };
    supportState.post.mockResolvedValue({ data: { status: "OK" } });
  });

  async function fillAndSubmit() {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Mavzu"), "Lot 10245");
    await user.type(screen.getByLabelText("Xabar"), "Deposit is still pending");
    await user.click(screen.getByRole("button", { name: "So‘rov yuborish" }));
  }

  it("clears the form only after an explicit OK", async () => {
    renderWithAppProviders(<SupportPage />);
    await fillAndSubmit();

    expect(await screen.findByRole("status")).toHaveTextContent(/yuborildi/i);
    expect(screen.getByLabelText("Mavzu")).toHaveValue("");
    expect(screen.getByLabelText("Xabar")).toHaveValue("");
  });

  it.each([
    ["application rejection", () => supportState.post.mockResolvedValueOnce({ data: { status: "ERROR" } })],
    ["network rejection", () => supportState.post.mockRejectedValueOnce(new Error("offline"))],
  ])("preserves the message after %s", async (_label, arrange) => {
    arrange();
    renderWithAppProviders(<SupportPage />);
    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent(/yuborilmadi/i);
    expect(screen.getByLabelText("Mavzu")).toHaveValue("Lot 10245");
    expect(screen.getByLabelText("Xabar")).toHaveValue("Deposit is still pending");
  });
});
