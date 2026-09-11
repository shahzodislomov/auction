"use client";

import {
  ChevronDown,
  LogOut,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useIntl } from "react-intl";

import { LangSwitch } from "@/context/LangSwitch";
import { AppSelect } from "@/components/ui/AppSelect";
import { useUserContext } from "@/context/UserContext";
import {
  champagneLocales,
  type ChampagneLocale,
} from "@/locales/champagne";
import {
  buildLocaleHref,
  persistBrowserLocale,
} from "@/lib/i18n/locale";
import ConfirmModal from "@/components/ui/ConfirmModal";

export interface PublicHeaderProps {
  pathname: string;
}

interface ShellUserContext {
  isAuthenticated: boolean;
  logout: () => Promise<void> | void;
  user: {
    firstname?: string;
    roles?: Array<string | { name?: string }>;
  } | null;
}

function hasAdminRole(user: ShellUserContext["user"]) {
  return user?.roles?.some((role) =>
    (typeof role === "string" ? role : role.name)?.trim().toUpperCase() === "ADMIN",
  ) ?? false;
}

const primaryLinks = [
  { href: "/auctions", messageId: "nav.auctions" },
  { href: "/faq", messageId: "nav.howItWorks" },
  { href: "/sell", messageId: "nav.sell" },
] as const;

const localeLabels: Record<ChampagneLocale, string> = {
  uz: "UZ",
  ru: "RU",
  en: "EN",
};

function isCurrentRoute(pathname: string, href: string) {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type LocaleControlProps = {
  compact?: boolean;
  className?: string;
};
export function LocaleControl({
  compact = false,
  className,
}: LocaleControlProps) {
  const intl = useIntl();
  const { currentLang, setCurrentLang } = useContext(LangSwitch);
  const pathname = usePathname();
  const router = useRouter();

  function selectLocale(locale: ChampagneLocale) {
    const browserSearchParams =
      typeof window === "undefined"
        ? new URLSearchParams()
        : new URLSearchParams(window.location.search);
    persistBrowserLocale(locale);
    setCurrentLang(locale);
    router.replace(
      buildLocaleHref(
        pathname,
        browserSearchParams,
        locale,
        typeof window === "undefined" ? "" : window.location.hash,
      ),
      { scroll: false },
    );
  }

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    selectLocale(event.target.value as ChampagneLocale);
  }

  if (!compact) {
    return (
      <div
        role="group"
        aria-label={intl.formatMessage({ id: "nav.locale" })}
          className={`flex min-h-11 items-center ${className ?? ""}`}
      >
        {champagneLocales.map((locale, index) => (
          <div key={locale} className="flex items-center">
            {index > 0 ? (
              <span aria-hidden="true" className="h-4 w-px bg-white/35" />
            ) : null}
            <button
              type="button"
              aria-pressed={currentLang === locale}
              // className="inline-flex min-h-11 min-w-10 items-center justify-center rounded-sm px-2 text-sm font-bold text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-pressed:text-brand-champagne-500"
              onClick={() => selectLocale(locale)}
                className={`inline-flex min-h-11 min-w-10 items-center justify-center rounded-sm px-2 text-sm font-bold transition-colors hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-pressed:text-brand-champagne-500 ${
    className ?? "text-white/85 hover:text-white"
  }`}
            >
              {localeLabels[locale]}
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex min-h-11 items-center ${className ?? ""}`}>
      <AppSelect
        size="sm"
        value={currentLang}
        onChange={(val) => selectLocale(val as ChampagneLocale)}
        options={champagneLocales.map((locale) => ({
          value: locale,
          label: localeLabels[locale],
        }))}
      />
    </div>
  );
}

export function PublicHeader({ pathname }: PublicHeaderProps) {
  const intl = useIntl();
  const { isAuthenticated, logout, user } =
    useUserContext() as ShellUserContext;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const accountLabel =
    user?.firstname || intl.formatMessage({ id: "nav.account" });
  const isAdmin = hasAdminRole(user);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const requestLogout = () => setLogoutConfirmOpen(true);
  const cancelLogout = () => {
    if (!logoutPending) setLogoutConfirmOpen(false);
  };
  const confirmLogout = async () => {
    setLogoutPending(true);
    try {
      await logout();
      setLogoutConfirmOpen(false);
    } finally {
      setLogoutPending(false);
    }
  };
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      detailsRef.current &&
      !detailsRef.current.contains(event.target as Node)
    ) {
      detailsRef.current.removeAttribute("open");
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy-900 text-white shadow-sticky">
      <div className="flex h-[var(--public-header-height)] items-center gap-5 px-[var(--content-gutter)] xl:px-[clamp(2rem,2.35vw,2.5rem)]">
        <Link
          href="/"
          aria-label={intl.formatMessage({ id: "nav.logo" })}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <Image
            src="/brand.png"
            alt=""
            width={80}
            height={80}
            priority
            className="h-11 w-11 object-contain xl:h-20 xl:w-20"
          />
          <span className="text-sm font-extrabold tracking-wide xl:text-xl">
            Tez<span className="text-brand-champagne-500">Auksion</span>
          </span>
        </Link>

        <nav
          aria-label={intl.formatMessage({ id: "nav.primary" })}
          className="ml-8 hidden flex-1 items-center gap-4 lg:flex"
        >
          {primaryLinks.map(({ href, messageId }) => (
            <Link
              key={href}
              href={href}
              aria-current={isCurrentRoute(pathname, href) ? "page" : undefined}
              className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-bold uppercase tracking-[0.015em] text-white/90 transition-colors [transition-duration:var(--motion-fast)] hover:bg-white/10 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-[current=page]:bg-white/12 aria-[current=page]:text-brand-champagne-500"
            >
              {intl.formatMessage({ id: messageId })}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            <LocaleControl />

            {isAuthenticated ? (
              <details  ref={detailsRef}  className="group relative">
                <summary
                  aria-label={accountLabel}
                  className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-sm border border-brand-champagne-500 bg-brand-champagne-500 px-4 text-sm font-bold text-brand-navy-900 hover:border-brand-champagne-600 hover:bg-brand-champagne-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  <UserRound aria-hidden="true" className="h-4 w-4" />
                  <span className="hidden 2xl:inline">
                    {accountLabel}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="absolute right-0 mt-2 w-52 rounded-md border border-border-default bg-surface-primary p-2 text-brand-navy-900 shadow-overlay">
                  <Link
                    href="/dashboard"
                    className="flex min-h-11 items-center rounded-md px-3 text-sm font-semibold hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  >
                    {intl.formatMessage({ id: "nav.dashboard" })}
                  </Link>
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="flex min-h-11 items-center rounded-md px-3 text-sm font-semibold hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    >
                      {intl.formatMessage({ id: "nav.admin" })}
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-semibold text-semantic-danger hover:bg-semantic-danger-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    onClick={requestLogout}
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    {intl.formatMessage({ id: "nav.logout" })}
                  </button>
                </div>
              </details>
            ) : (
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-brand-champagne-500 bg-brand-champagne-500 px-5 text-sm font-bold uppercase tracking-[0.015em] text-brand-navy-900 hover:border-brand-champagne-600 hover:bg-brand-champagne-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                <UserRound aria-hidden="true" className="h-4 w-4" />
                <span className="hidden lg:inline">
                  {intl.formatMessage({ id: "nav.login" })}
                </span>
              </Link>
            )}
          </div>

          <button
            type="button"
            aria-controls="public-mobile-menu"
            aria-expanded={mobileMenuOpen}
            aria-label={intl.formatMessage({
              id: mobileMenuOpen ? "nav.closeMenu" : "nav.openMenu",
            })}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <nav
          id="public-mobile-menu"
          aria-label={intl.formatMessage({ id: "nav.primary" })}
          className="border-t border-border-default bg-surface-primary px-[var(--content-gutter)] py-4 text-brand-navy-900 shadow-overlay lg:hidden"
        >
          <div className="mx-auto grid max-w-[var(--content-max-width)] gap-1">
            {primaryLinks.map(({ href, messageId }) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  isCurrentRoute(pathname, href) ? "page" : undefined
                }
                className="flex min-h-11 items-center rounded-md px-3 text-sm font-semibold hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-[current=page]:bg-surface-muted aria-[current=page]:text-brand-gold-text"
                onClick={closeMobileMenu}
              >
                {intl.formatMessage({ id: messageId })}
              </Link>
            ))}
            <Link
              href="/auctions#search"
              className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              onClick={closeMobileMenu}
            >
              <Search aria-hidden="true" className="h-4 w-4" />
              {intl.formatMessage({ id: "nav.search" })}
            </Link>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border-default pt-3">
              <LocaleControl compact />
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex min-h-11 items-center px-3 text-sm font-semibold"
                    onClick={closeMobileMenu}
                  >
                    {intl.formatMessage({ id: "nav.dashboard" })}
                  </Link>
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="inline-flex min-h-11 items-center px-3 text-sm font-semibold"
                      onClick={closeMobileMenu}
                    >
                      {intl.formatMessage({ id: "nav.admin" })}
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold text-semantic-danger"
                    onClick={() => {
                      closeMobileMenu();
                      requestLogout();
                    }}
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    {intl.formatMessage({ id: "nav.logout" })}
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold"
                  onClick={closeMobileMenu}
                >
                  <UserRound aria-hidden="true" className="h-4 w-4" />
                  {intl.formatMessage({ id: "nav.login" })}
                </Link>
              )}
            </div>
          </div>
        </nav>
      ) : null}
      <ConfirmModal
        open={logoutConfirmOpen}
        title={intl.formatMessage({ id: "logouttitle" })}
        description={intl.formatMessage({
          id: "logoutdescription",
          defaultMessage: "Hisobdan chiqish uchun amalni tasdiqlang.",
        })}
        confirmText={intl.formatMessage({ id: "logoutconfirm" })}
        cancelText={intl.formatMessage({ id: "cancel" })}
        loading={logoutPending}
        onCancel={cancelLogout}
        onConfirm={() => {
          void confirmLogout();
        }}
      />
    </header>
  );
}
