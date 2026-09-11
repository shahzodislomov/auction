import { fireEvent, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/AppShell";
import { CabinetShell } from "@/components/cabinet/CabinetShell";
import { renderWithAppProviders } from "@/test/render";

const navigationState = vi.hoisted(() => ({
  pathname: "/auctions/42",
  replace: vi.fn(),
  search: "make=Chevrolet&lang=en&page=2",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
  useRouter: () => ({ replace: navigationState.replace }),
  useSearchParams: () => new URLSearchParams(navigationState.search),
}));

const authState = vi.hoisted(() => ({
  isAuthenticated: true,
  logout: vi.fn(),
  user: { firstname: "Aziza", roles: [] as Array<{ name: string }> },
}));

vi.mock("@/context/UserContext", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => children,
  useUserContext: () => authState,
}));

describe("AppShell", () => {
  beforeEach(() => {
    authState.logout.mockClear();
    authState.user.roles = [];
    navigationState.pathname = "/auctions/42";
    navigationState.replace.mockClear();
    navigationState.search = "make=Chevrolet&lang=en&page=2";
    window.history.replaceState(null, "", "/auctions/42?make=Chevrolet&lang=en&page=2#bids");
    window.localStorage.clear();
  });

  it("keeps the current route and filters when selecting a locale", () => {
    renderWithAppProviders(
      <AppShell pathname="/auctions/42">
        <div>content</div>
      </AppShell>,
      { locale: "en" },
    );

    fireEvent.click(screen.getByRole("button", { name: "RU" }));

    expect(navigationState.replace).toHaveBeenCalledWith(
      "/auctions/42?make=Chevrolet&lang=ru&page=2#bids",
      { scroll: false },
    );
    expect(window.localStorage.getItem("tezauksion.locale")).toBe("ru");
  });

  it("renders the complete public navigation and marks the current route", () => {
    renderWithAppProviders(
      <AppShell pathname="/auctions">
        <div>content</div>
      </AppShell>,
    );

    expect(
      screen.getByRole("link", { name: /auksionlar/i }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: /avtomobil sotish/i }),
    ).toHaveAttribute("href", "/sell");
  });

  it("labels the authenticated account control and confirms before logging out", () => {
    renderWithAppProviders(
      <AppShell pathname="/auctions">
        <div>content</div>
      </AppShell>,
    );

    const accountSummary = screen.getByText("Aziza").closest("summary");
    expect(accountSummary).toHaveAttribute("aria-label", "Aziza");

    fireEvent.click(accountSummary!);
    fireEvent.click(screen.getByRole("button", { name: "Chiqish" }));

    expect(authState.logout).not.toHaveBeenCalled();
    expect(screen.getByText("Rostan ham chiqmoqchimisiz?")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Ha, chiqish." }));
    expect(authState.logout).toHaveBeenCalledOnce();
  });

  it("shows the admin destination only to users with the ADMIN role", () => {
    const view = renderWithAppProviders(
      <AppShell pathname="/auctions"><div>content</div></AppShell>,
    );

    fireEvent.click(screen.getByText("Aziza").closest("summary")!);
    expect(screen.queryByRole("link", { name: "Admin paneli" })).not.toBeInTheDocument();

    authState.user.roles = [{ name: "ADMIN" }];
    view.rerender(
      <AppShell pathname="/auctions"><div>content</div></AppShell>,
    );
    fireEvent.click(screen.getByText("Aziza").closest("summary")!);
    expect(screen.getByRole("link", { name: "Admin paneli" })).toHaveAttribute("href", "/admin");
  });

  it("renders only the cabinet mobile navigation on a dashboard route", () => {
    renderWithAppProviders(
      <AppShell pathname="/dashboard/watchlist">
        <CabinetShell
          active="watchlist"
          description="Saved vehicles"
          eyebrow="Account"
          title="Watchlist"
        >
          <div>content</div>
        </CabinetShell>
      </AppShell>,
    );

    expect(
      screen.queryByRole("navigation", { name: "Mobil navigatsiya" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    const mobileNavigation = screen.getByRole("navigation", {
      name: "Mobil kabinet yo‘nalishlari",
    });
    const currentLinks = within(mobileNavigation)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");

    expect(currentLinks).toHaveLength(1);
    expect(
      within(mobileNavigation).getByRole("link", { name: "Saqlanganlar" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("uses the shared confirmation modal before logging out from the user panel", () => {
    renderWithAppProviders(
      <AppShell pathname="/dashboard">
        <CabinetShell active="" description="Account overview" eyebrow="Account" title="Cabinet">
          <div>content</div>
        </CabinetShell>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Aziza: Mening profilim" }));
    fireEvent.click(screen.getByRole("button", { name: "Chiqish" }));
    const dialog = screen.getByRole("dialog", { name: "Rostan ham chiqmoqchimisiz?" });
    expect(within(dialog).getByText("Shaxsiy kabinetingizdan chiqish uchun amalni tasdiqlang.")).toBeVisible();
    expect(authState.logout).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "Ha, chiqish." }));
    expect(authState.logout).toHaveBeenCalledOnce();
  });

  it("collapses the dashboard sidebar to icons and expands it from the account avatar", () => {
    renderWithAppProviders(
      <AppShell pathname="/dashboard">
        <CabinetShell active="" description="Account overview" eyebrow="Account" title="Cabinet">
          <div>content</div>
        </CabinetShell>
      </AppShell>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Menyuni yopish" })[1]);
    expect(screen.getAllByRole("button", { name: "Menyuni ochish" })[1]).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /Menu bo‘limlarini qidirish/i }));
    expect(screen.getAllByRole("button", { name: "Menyuni yopish" })[1]).toBeVisible();

    fireEvent.click(screen.getAllByRole("button", { name: "Menyuni yopish" })[1]);
    fireEvent.click(screen.getByRole("button", { name: "Aziza: Mening profilim" }));
    expect(screen.getAllByRole("button", { name: "Menyuni yopish" })[1]).toBeVisible();
  });

  it("focuses sidebar search with Shift+S and filters links by localized label or URL", () => {
    renderWithAppProviders(
      <AppShell pathname="/dashboard">
        <CabinetShell active="" description="Account overview" eyebrow="Account" title="Cabinet">
          <div>content</div>
        </CabinetShell>
      </AppShell>,
    );

    fireEvent.keyDown(document, { key: "S", shiftKey: true });
    const search = screen.getByRole("searchbox", { name: "Menu bo‘limlarini qidirish" });
    expect(search).toHaveFocus();

    fireEvent.change(search, { target: { value: "/dashboard/payments" } });
    const sidebar = screen.getByRole("navigation", { name: "Kabinet bo‘limlari" });
    expect(within(sidebar).getByRole("link", { name: "To‘lovlar" })).toBeVisible();
    expect(within(sidebar).queryByRole("link", { name: "Saqlanganlar" })).not.toBeInTheDocument();
  });

  it("removes public navigation and footer from the admin workspace", () => {
    renderWithAppProviders(
      <AppShell pathname="/admin/moderation">
        <div>admin content</div>
      </AppShell>,
    );

    expect(
      screen.queryByRole("navigation", { name: "Mobil navigatsiya" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });

  it("removes public navigation and footer from the auth pages", () => {
    renderWithAppProviders(
      <AppShell pathname="/login">
        <div>login content</div>
      </AppShell>,
    );

    expect(
      screen.queryByRole("navigation", { name: "Mobil navigatsiya" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });

  it("marks the mobile-menu sell action current on the sell route", () => {
    renderWithAppProviders(
      <AppShell pathname="/sell">
        <div>content</div>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Menyuni ochish" }));
    const mobileMenu = document.getElementById("public-mobile-menu");

    expect(mobileMenu).not.toBeNull();
    expect(
      within(mobileMenu!).getByRole("link", { name: "Avtomobil sotish" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
