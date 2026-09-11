"use client";

import type { StatusBadgeTone } from "@/components/ui/StatusBadge";

export interface AdminFilterTabOption {
  count: number;
  label: string;
  tone?: StatusBadgeTone;
  value: string;
}

export function AdminFilterTabs({
  ariaLabel,
  disabled = false,
  onChange,
  options,
  value,
}: {
  ariaLabel: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: readonly AdminFilterTabOption[];
  value: string;
}) {
  return (
    <div
      aria-label={ariaLabel}
      className="flex min-w-0 w-full gap-7 overflow-x-auto border-b border-border-default"
      role="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;
        const danger = active && option.tone === "danger";

        return (
          <button
            aria-label={`${option.label}: ${option.count}`}
            aria-selected={active}
            className={`-mb-px inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-1 text-sm font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50 ${
              danger
                ? "border-semantic-danger text-semantic-danger"
                : active
                  ? "border-brand-gold-text text-brand-navy-900"
                  : "border-transparent text-text-secondary hover:border-border-strong hover:text-brand-navy-900"
            }`}
            disabled={disabled}
            key={option.value || "all"}
            onClick={() => onChange(option.value)}
            role="tab"
            type="button"
          >
            <span>{option.label}</span>
            <span
              className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                active ? "bg-brand-champagne-500/25 text-brand-navy-900" : "bg-surface-muted text-text-secondary"
              }`}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
