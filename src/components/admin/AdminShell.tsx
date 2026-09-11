"use client";

import {
  BadgeDollarSign,
  CircleGauge,
  ClipboardCheck,
  FileClock,
  FileCheck2,
  FileText,
  Gavel,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  ShieldAlert,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useContext, useId, useState, type ReactNode } from "react";

import ConfirmModal from "@/components/ui/ConfirmModal";
import { SidebarAccountMenu } from "@/components/layout/SidebarAccountMenu";
import { SidebarNavSearch } from "@/components/layout/SidebarNavSearch";
import { LangSwitch, type Lang } from "@/context/LangSwitch";
import { useUserContext } from "@/context/UserContext";
import { translateUiText } from "@/lib/localization/uiText";
import Image from "next/image";

const nav = [
  { slug: "", icon: CircleGauge },
  { slug: "moderation", icon: ClipboardCheck },
  { slug: "kyc", icon: FileCheck2 },
  { slug: "users", icon: UsersRound },
  { slug: "auctions", icon: Gavel },
  { slug: "ai-processing", icon: Sparkles },
  { slug: "finance", icon: BadgeDollarSign },
  { slug: "contracts", icon: FileText },
  { slug: "disputes", icon: Scale },
  { slug: "risk", icon: ShieldAlert },
  { slug: "audit", icon: FileClock },
] as const;

const languageOptions: Array<{ label: string; value: Lang }> = [
  { label: "UZ", value: "uz" },
  { label: "RU", value: "ru" },
  { label: "EN", value: "en" },
];

const shellMessages: Record<
  Lang,
  {
    center: string;
    eyebrow: string;
    navLabel: string;
    userPanel: string;
    logout: string;
    logoutTitle: string;
    logoutDescription: string;
    logoutConfirm: string;
    cancel: string;
    labels: Record<string, string>;
  }
> = {
  uz: {
    center: "Operatsion markaz",
    eyebrow: "Operatsion boshqaruv",
    navLabel: "Admin bo‘limlari",
    userPanel: "Mening profilim",
    logout: "Chiqish",
    logoutTitle: "Hisobdan chiqasizmi?",
    logoutDescription: "Admin paneldan chiqish uchun amalni tasdiqlang.",
    logoutConfirm: "Chiqish",
    cancel: "Bekor qilish",
    labels: {
      "": "Boshqaruv",
      moderation: "Moderatsiya",
      kyc: "Shaxsni tasdiqlash",
      "vehicle-documents": "Vehicle hujjatlari",
      contracts: "Shartnomalar",
      users: "Foydalanuvchilar",
      vehicles: "Avtomobillar",
      auctions: "Auksionlar",
      "ai-processing": "AI Photo qayta ishlash",
      finance: "Moliya",
      "reference-data": "Ma’lumotnomalar",
      disputes: "Nizolar",
      risk: "Risk nazorati",
      audit: "Audit jurnali",
    },
  },
  en: {
    center: "Operations center",
    eyebrow: "Operational control",
    navLabel: "Admin sections",
    userPanel: "My Profile",
    logout: "Logout",
    logoutTitle: "Log out?",
    logoutDescription: "Confirm that you want to leave the admin panel.",
    logoutConfirm: "Logout",
    cancel: "Cancel",
    labels: {
      "": "Overview",
      moderation: "Moderation",
      kyc: "Identity verification",
      "vehicle-documents": "Vehicle documents",
      contracts: "Contracts",
      users: "Users",
      vehicles: "Vehicles",
      auctions: "Auctions",
      "ai-processing": "AI Photo processing",
      finance: "Finance",
      "reference-data": "Reference data",
      disputes: "Disputes",
      risk: "Risk control",
      audit: "Audit log",
    },
  },
  ru: {
    center: "Операционный центр",
    eyebrow: "Операционное управление",
    navLabel: "Разделы администратора",
    userPanel: "Мой профиль",
    logout: "Выйти",
    logoutTitle: "Выйти из аккаунта?",
    logoutDescription: "Подтвердите выход из панели администратора.",
    logoutConfirm: "Выйти",
    cancel: "Отмена",
    labels: {
      "": "Обзор",
      moderation: "Модерация",
      kyc: "Проверка личности",
      "vehicle-documents": "Документы авто",
      contracts: "Контракты",
      users: "Пользователи",
      vehicles: "Автомобили",
      auctions: "Аукционы",
      "ai-processing": "AI Обработка фото",
      finance: "Финансы",
      "reference-data": "Справочники",
      disputes: "Споры",
      risk: "Контроль рисков",
      audit: "Журнал аудита",
    },
  },
};

export function AdminShell({
  accessStatus,
  active,
  children,
  description,
  identityName,
  identityRole,
  title,
}: {
  accessStatus: string;
  active: string;
  children: ReactNode;
  description: string;
  identityName: string;
  identityRole: string;
  title: string;
}) {
  const { currentLang, setCurrentLang } = useContext(LangSwitch);
  const copy = shellMessages[currentLang];
  const titleId = useId();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const { logout } = useUserContext() as { logout: () => Promise<void> | void };
  const confirmLogout = async () => {
    setLogoutPending(true);
    try {
      await logout();
      setLogoutConfirmOpen(false);
    } finally {
      setLogoutPending(false);
    }
  };
  const initials =
    identityName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toLocaleUpperCase())
      .join("") || "A";
  const normalizedNavSearch = navSearch.trim().toLocaleLowerCase(currentLang);
  const filteredNav = nav.filter(({ slug }) => {
    if (!normalizedNavSearch) return true;
    const label = copy.labels[slug].toLocaleLowerCase(currentLang);
    const href = (slug ? `/admin/${slug}` : "/admin").toLocaleLowerCase();
    return label.includes(normalizedNavSearch) || href.includes(normalizedNavSearch);
  });

  return (
    <div className="min-h-dvh bg-surface-canvas">
      <ConfirmModal
        cancelText={copy.cancel}
        confirmText={copy.logoutConfirm}
        description={copy.logoutDescription}
        loading={logoutPending}
        onCancel={() => {
          if (!logoutPending) setLogoutConfirmOpen(false);
        }}
        onConfirm={() => void confirmLogout()}
        open={logoutConfirmOpen}
        title={copy.logoutTitle}
      />
      <div className={`grid items-start gap-6 transition-[grid-template-columns] duration-200 ${sidebarCollapsed ? "xl:grid-cols-[76px_minmax(0,1fr)]" : "xl:grid-cols-[268px_minmax(0,1fr)]"}`}>
        <aside className="hidden h-dvh self-start overflow-hidden bg-brand-navy-950 text-white shadow-sticky xl:sticky xl:top-0 xl:flex xl:flex-col">
          <div className={`flex min-h-[5.25rem] items-center border-b border-white/10 ${sidebarCollapsed ? "justify-center px-2" : "gap-2 px-4"}`}>
            {!sidebarCollapsed ? (
              <Link href="/" className="group flex min-w-0 flex-1 items-center gap-3">
                <Image src="/brand.png" alt="TezAuksion" height={42} width={42} className="size-10 shrink-0 object-contain" />
                <span className="min-w-0">
                  <span className="block truncate text-lg font-extrabold text-white transition-colors group-hover:text-brand-champagne-500">TezAuksion</span>
                  <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-white/55">{copy.center}</span>
                </span>
              </Link>
            ) : null}
            <button
              aria-label={translateUiText(sidebarCollapsed ? "expandMenu" : "collapseMenu", currentLang)}
              className="grid size-11 shrink-0 place-items-center rounded-xl text-white/65 transition-colors hover:bg-white/10 hover:text-brand-champagne-500 focus-visible:outline-2 focus-visible:outline-brand-champagne-500"
              onClick={() => setSidebarCollapsed((current) => !current)}
              type="button"
            >
              {sidebarCollapsed ? <PanelLeftOpen aria-hidden="true" size={22} /> : <PanelLeftClose aria-hidden="true" size={22} />}
            </button>
          </div>
          <SidebarNavSearch
            compact={sidebarCollapsed}
            onChange={setNavSearch}
            onRequestExpand={() => setSidebarCollapsed(false)}
            value={navSearch}
          />
          <nav aria-label={copy.navLabel} className="min-h-0 flex-1 overflow-y-auto p-2">
            {filteredNav.map(({ icon: Icon, slug }) => {
              const current = active === slug;
              const label = copy.labels[slug];
              return (
                <Link
                  key={slug || "overview"}
                  href={slug ? `/admin/${slug}` : "/admin"}
                  aria-current={current ? "page" : undefined}
                  className={`flex min-h-11 items-center rounded-md text-sm font-bold transition-colors ${sidebarCollapsed ? "mx-auto size-12 justify-center px-0" : "gap-3 px-3 py-2.5"} ${current ? "bg-brand-champagne-500 text-brand-navy-950" : "text-white/70 hover:bg-white/8 hover:text-white"}`}
                  title={sidebarCollapsed ? label : undefined}
                >
                  <Icon aria-hidden="true" size={sidebarCollapsed ? 22 : 18} strokeWidth={1.8} />
                  <span className={sidebarCollapsed ? "sr-only" : undefined}>{label}</span>
                </Link>
              );
            })}
          </nav>
          <SidebarAccountMenu
            compact={sidebarCollapsed}
            initials={initials}
            links={[
              {
                href: "/",
                icon: Home,
                label: currentLang === "ru" ? "Главный сайт" : currentLang === "uz" ? "Bosh sahifa" : "Main site",
              },
              { href: "/dashboard", icon: UserRound, label: copy.userPanel },
            ]}
            logoutLabel={copy.logout}
            menuLabel={`${identityName}: ${copy.userPanel}`}
            name={identityName}
            onLogout={() => setLogoutConfirmOpen(true)}
            onRequestExpand={() => setSidebarCollapsed(false)}
            role={identityRole}
          />
        </aside>

        <section aria-labelledby={titleId} className="mt-4 min-w-0 px-4 md:px-6 xl:px-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border-default bg-white p-3.5 rounded-xl shadow-sm xl:hidden">
            <Link href="/" className="flex items-center gap-2.5 text-brand-navy-950 font-extrabold text-base hover:opacity-90 transition-opacity">
              <Image src="/brand.png" alt="TezAuksion" height={32} width={32} className="h-8 w-8 object-contain" />
              <span>TezAuksion</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-primary px-3 py-1.5 text-xs font-bold text-brand-navy-900 hover:bg-surface-muted transition-colors">
                <Home aria-hidden="true" size={14} />
                <span>{currentLang === "ru" ? "На главную" : currentLang === "uz" ? "Bosh sahifa" : "Main Page"}</span>
              </Link>
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-primary px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-surface-muted transition-colors">
                <UserRound aria-hidden="true" size={14} />
                <span>{copy.userPanel}</span>
              </Link>
            </div>
          </div>

          <nav
            aria-label={copy.navLabel}
            className="mb-5 flex gap-2 overflow-x-auto border-y border-border-default bg-white px-2 py-3 xl:hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {nav.map(({ slug }) => {
              const label = copy.labels[slug];
              return (
                <Link
                  key={slug || "overview"}
                  href={slug ? `/admin/${slug}` : "/admin"}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition-all ${active === slug ? "bg-brand-navy-900 text-white shadow-sm" : "border border-border-default bg-white text-text-secondary hover:bg-surface-muted"}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <header className="mb-6 border-b border-border-default pb-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-brand-gold-text">
                  {copy.eyebrow}
                </p>
                <h1 id={titleId} className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-brand-navy-900 md:text-4xl">
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
                  {description}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-4">
                <div className="flex min-h-11 items-center" role="group" aria-label={translateUiText("language", currentLang)}>
                  {languageOptions.map((option, index) => (
                    <div className="flex items-center" key={option.value}>
                      {index > 0 ? <span aria-hidden="true" className="h-4 w-px bg-border-default" /> : null}
                      <button
                        aria-pressed={currentLang === option.value}
                        className="inline-flex min-h-11 min-w-10 items-center justify-center rounded-sm px-2 text-sm font-bold text-brand-navy-900 transition-colors hover:bg-surface-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-pressed:text-brand-gold-text"
                        onClick={() => setCurrentLang(option.value)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                  <span className="h-2.5 w-2.5 rounded-full bg-semantic-success shrink-0" />{" "}
                  {accessStatus}
                </div>
              </div>
            </div>
          </header>
          <div className="pb-16 pt-2 xl:pb-24">{children}</div>
        </section>
      </div>
    </div>
  );
}
