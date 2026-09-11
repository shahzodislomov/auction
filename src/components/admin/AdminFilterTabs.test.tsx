import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AdminFilterTabs } from "./AdminFilterTabs";

describe("AdminFilterTabs", () => {
  it("shows counts and changes the selected status", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AdminFilterTabs
        ariaLabel="Holat"
        onChange={onChange}
        options={[
          { count: 10, label: "Barchasi", value: "" },
          { count: 3, label: "Tekshiruvda", value: "PENDING" },
          { count: 2, label: "Rad etilgan", tone: "danger", value: "REJECTED" },
        ]}
        value=""
      />,
    );

    const selectedTab = screen.getByRole("tab", { name: "Barchasi: 10" });
    expect(selectedTab).toHaveAttribute("aria-selected", "true");
    expect(selectedTab).toHaveClass("border-brand-gold-text");
    expect(selectedTab).not.toHaveClass("rounded-full", "bg-brand-navy-900");
    await user.click(screen.getByRole("tab", { name: "Rad etilgan: 2" }));
    expect(onChange).toHaveBeenCalledWith("REJECTED");
  });
});
