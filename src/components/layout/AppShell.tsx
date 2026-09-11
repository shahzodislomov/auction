"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useIntl } from "react-intl";

import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";

export interface AppShellProps {
  children: ReactNode;
  pathname?: string;
}

interface AppShellFrameProps {
  children: ReactNode;
  pathname: string;
}

function AppShellFrame({ children, pathname }: AppShellFrameProps) {
  const intl = useIntl();

  const isAuthPage =
    pathname === "/login" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/register/") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/forgot-password/")

  const usesWorkspaceNavigation =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

    const hideHeaderFooter = usesWorkspaceNavigation || isAuthPage;
  return (
    <div className="app-shell flex min-h-dvh flex-col bg-surface-canvas text-text-primary">
      <a className="skip-link" href="#main-content">
        {intl.formatMessage({ id: "a11y.skipToContent" })}
      </a>
      {!hideHeaderFooter && <PublicHeader pathname={pathname} />}
      <main id="main-content" tabIndex={-1} className="app-main flex-1">
        {children}
      </main>
      {!hideHeaderFooter && (
        <PublicFooter reserveCabinetMobileNav={false} />
      )}
      {!hideHeaderFooter && (
        <MobileNavigation pathname={pathname} />
      )}
    </div>
  );
}

function RoutedAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return <AppShellFrame pathname={pathname ?? "/"}>{children}</AppShellFrame>;
}

export function AppShell({ children, pathname }: AppShellProps) {
  if (pathname !== undefined) {
    return <AppShellFrame pathname={pathname}>{children}</AppShellFrame>;
  }

  return <RoutedAppShell>{children}</RoutedAppShell>;
}
