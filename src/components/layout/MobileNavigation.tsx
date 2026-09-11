"use client";

import { Gavel, Heart, House, UserRound } from "lucide-react";
import Link from "next/link";
import { useIntl } from "react-intl";

import { useUserContext } from "@/context/UserContext";

export interface MobileNavigationProps {
  pathname: string;
}

function isPathWithin(pathname: string, href: string) {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNavigation({ pathname }: MobileNavigationProps) {
  const intl = useIntl();
  const { isAuthenticated } = useUserContext();

  const destinations = [
    {
      href: "/",
      icon: House,
      labelId: "mobile.home",
      accessibleLabelId: "mobile.homeLabel",
    },
    {
      href: "/auctions",
      icon: Gavel,
      labelId: "mobile.auctions",
      accessibleLabelId: "mobile.auctionsLabel",
    },
    {
      href: "/dashboard/watchlist",
      icon: Heart,
      labelId: "mobile.watchlist",
      accessibleLabelId: "mobile.watchlistLabel",
    },
    {
      href: isAuthenticated ? "/dashboard" : "/login",
      icon: UserRound,
      labelId: "mobile.account",
      accessibleLabelId: "mobile.accountLabel",
    },
  ] as const;

  const currentHref = destinations.reduce<string | undefined>(
    (mostSpecificHref, destination) => {
      if (!isPathWithin(pathname, destination.href)) return mostSpecificHref;
      if (!mostSpecificHref) return destination.href;

      return destination.href.length > mostSpecificHref.length
        ? destination.href
        : mostSpecificHref;
    },
    undefined,
  );

  return (
    <nav
      aria-label={intl.formatMessage({ id: "mobile.primary" })}
      className="fixed inset-x-0 bottom-0 z-50 grid h-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom))] grid-cols-4 rounded-t-2xl border-t border-border-default/70 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgb(4_18_43_/_0.08)] backdrop-blur-md md:hidden"
    >
      {destinations.map(({ accessibleLabelId, href, icon: Icon, labelId }) => {
        const isCurrent = currentHref === href;

        return (
          <Link
            key={labelId}
            href={href}
            aria-current={isCurrent ? "page" : undefined}
            aria-label={intl.formatMessage({ id: accessibleLabelId })}
            className="flex min-h-11 flex-col items-center justify-center gap-1 px-1 text-xs sm:text-sm font-bold text-text-secondary transition-colors focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-focus-ring aria-[current=page]:text-brand-gold-text"
          >
            <div className="relative flex items-center justify-center">
              <Icon aria-hidden="true" className="h-5 w-5 transition-transform group-hover:scale-110" />
            </div>
            <span aria-hidden="true">
              {intl.formatMessage({ id: labelId })}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
