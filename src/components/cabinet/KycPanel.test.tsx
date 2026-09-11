import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { KycPanel } from "./KycPanel";

const upload = vi.hoisted(() => ({
  isPending: false,
  mutateAsync: vi.fn(),
}));

vi.mock("@/queries/users", () => ({
  useUserDocumentUpload: () => upload,
}));

const user = {
  firstName: "Ali",
  lastName: "Valiyev",
  orgTaxId: "",
  userType: "INDIVIDUAL",
  dateOfBirth: "1995-05-12",
  phone: "+998901234567",
  email: "ali@example.uz",
};

describe("KycPanel", () => {
  beforeEach(() => {
    upload.isPending = false;
    upload.mutateAsync.mockReset();
    upload.mutateAsync.mockResolvedValue({ status: "OK" });
  });

  it("shows that admin approval is pending after a passport is uploaded", async () => {
    const browser = userEvent.setup();
    render(<KycPanel user={user} />);

    const passport = new File(["passport-image"], "passport.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(screen.getByLabelText("Fayl"), {
      target: { files: [passport] },
    });
    await browser.click(screen.getByRole("button", { name: "Tasdiqlash arizasini yuborish" }));

    await waitFor(() => {
      expect(upload.mutateAsync).toHaveBeenCalledWith({
        docType: "PASSPORT",
        file: passport,
      });
    });
    expect(
      await screen.findByRole("heading", { name: "Moderator tasdig‘i kutilmoqda" }),
    ).toBeVisible();
    expect(screen.getByText(/tekshiruv tugaguncha/i)).toBeVisible();
  });

  it("shows localized field errors for required KYC inputs before submitting", async () => {
    const browser = userEvent.setup();
    render(<KycPanel user={{ ...user, email: "" }} />);

    await browser.click(screen.getByRole("button", { name: "Tasdiqlash arizasini yuborish" }));

    expect(screen.getByText("E-mail manzilni kiriting")).toBeVisible();
    expect(screen.getByText("Hujjat faylini tanlang")).toBeVisible();
    expect(upload.mutateAsync).not.toHaveBeenCalled();
  });

  it("shows approved status without an editable form", () => {
    render(<KycPanel user={{ ...user, kycStatus: "APPROVED" }} />);

    expect(screen.getByText("Tasdiqlangan")).toBeVisible();
    expect(screen.getByText("Tasdiq")).toBeVisible();
    expect(screen.queryByRole("button", { name: /Tasdiqlash arizasini yuborish/i })).not.toBeInTheDocument();
  });

  it("shows a rejection reason and allows resubmission", () => {
    render(<KycPanel user={{ ...user, kycStatus: "REJECTED", kycRejectionReason: "Pasport rasmi xira" }} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Pasport rasmi xira");
    expect(screen.getByRole("button", { name: "Tuzatib qayta yuborish" })).toBeVisible();
  });
});
