"use client";

import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import Link from "next/link";
import { useId, useState, type ComponentType } from "react";

type AccountIcon = ComponentType<{
  "aria-hidden"?: boolean | "true" | "false";
  size?: number;
  strokeWidth?: number;
}>;

type AccountLink = {
  href: string;
  icon: AccountIcon;
  label: string;
};

export function SidebarAccountMenu({
  compact = false,
  initials,
  links,
  logoutLabel,
  menuLabel,
  name,
  onLogout,
  onRequestExpand,
  role,
}: {
  compact?: boolean;
  initials: string;
  links: AccountLink[];
  logoutLabel: string;
  menuLabel: string;
  name: string;
  onLogout: () => void;
  onRequestExpand?: () => void;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const identity = (
    <>
      <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-white/75 bg-[#eef2f1] text-sm font-black tracking-wide text-brand-navy-800 shadow-[inset_0_0_0_2px_rgba(7,31,68,0.13)]">
        {initials}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-extrabold text-white">{name}</span>
      </span>
    </>
  );

  return (
    <div className={`mt-auto border-t border-white/10 bg-black/5 ${compact ? "p-2" : "p-3"}`}>
      {open && !compact ? (
        <div className="mb-3" id={menuId}>
          <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.045] shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3 p-4">{identity}</div>
            <nav aria-label={menuLabel} className="border-t border-white/10 p-2">
              {links.map(({ href, icon: Icon, label }) => (
                <Link
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold text-white/80 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-champagne-500"
                  href={href}
                  key={href}
                >
                  <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="border-t border-white/10 p-2">
              <button
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-extrabold text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-300"
                onClick={onLogout}
                type="button"
              >
                <LogOut aria-hidden="true" size={20} strokeWidth={1.8} />
                <span>{logoutLabel}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-label={menuLabel}
        className={`flex min-h-[4.5rem] w-full items-center rounded-2xl transition-colors hover:bg-white/[0.055] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-champagne-500 ${compact ? "justify-center px-0" : "gap-3 px-2.5"}`}
        onClick={() => {
          if (compact) {
            onRequestExpand?.();
            return;
          }
          setOpen((current) => !current);
        }}
        type="button"
      >
        {compact ? (
          <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-white/75 bg-[#eef2f1] text-sm font-black tracking-wide text-brand-navy-800 shadow-[inset_0_0_0_2px_rgba(7,31,68,0.13)]">
            {initials}
          </span>
        ) : identity}
        {!compact && open ? (
          <ChevronDown aria-hidden="true" className="shrink-0 text-white/55" size={20} />
        ) : !compact ? (
          <ChevronUp aria-hidden="true" className="shrink-0 text-white/55" size={20} />
        ) : null}
      </button>
    </div>
  );
}
