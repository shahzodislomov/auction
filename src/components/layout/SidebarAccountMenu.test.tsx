import { fireEvent, render, screen } from "@testing-library/react";
import { Home, UserRound } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { SidebarAccountMenu } from "./SidebarAccountMenu";

describe("SidebarAccountMenu", () => {
  it("reveals account destinations and logout from the compact identity trigger", () => {
    const onLogout = vi.fn();
    render(
      <SidebarAccountMenu
        initials="DR"
        links={[
          { href: "/", icon: Home, label: "Bosh sahifa" },
          { href: "/dashboard", icon: UserRound, label: "Mening profilim" },
        ]}
        logoutLabel="Chiqish"
        menuLabel="Dilshod Raximov: Mening profilim"
        name="Dilshod Raximov"
        onLogout={onLogout}
        role="ADMIN"
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Dilshod Raximov: Mening profilim",
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Bosh sahifa" })).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Bosh sahifa" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Mening profilim" })).toHaveAttribute("href", "/dashboard");
    fireEvent.click(screen.getByRole("button", { name: "Chiqish" }));
    expect(onLogout).toHaveBeenCalledOnce();
  });
});
