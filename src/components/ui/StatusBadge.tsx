"use client";

import type { HTMLAttributes } from "react";

export type StatusBadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "info"
  | "danger";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusBadgeTone;
}

const toneClasses: Record<StatusBadgeTone, string> = {
  neutral: "bg-surface-muted text-text-secondary",
  success: "bg-semantic-success-surface text-semantic-success",
  warning: "bg-semantic-warning-surface text-semantic-warning",
  info: "bg-semantic-info-surface text-semantic-info",
  danger: "bg-semantic-danger-surface text-semantic-danger",
};

export function StatusBadge({
  children,
  className = "",
  tone = "neutral",
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex min-h-6 items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold leading-none",
        toneClasses[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

export const STATUS_MAP: Record<
  string,
  { label: { ru: string; uz: string; en: string }; tone: StatusBadgeTone }
> = {
  PENDING_REVIEW: { label: { ru: "На модерации", uz: "Moderatsiyada", en: "Pending Review" }, tone: "warning" },
  SCHEDULED: { label: { ru: "Запланирован", uz: "Rejalashtirilgan", en: "Scheduled" }, tone: "info" },
  LIVE: { label: { ru: "Прямой эфир", uz: "Jonli", en: "Live" }, tone: "success" },
  ACTIVE: { label: { ru: "Активен", uz: "Faol", en: "Active" }, tone: "success" },
  FINISHED: { label: { ru: "Завершён", uz: "Tugallangan", en: "Finished" }, tone: "neutral" },
  CANCELED: { label: { ru: "Отменён", uz: "Bekor qilingan", en: "Canceled" }, tone: "danger" },
  DRAFT: { label: { ru: "Черновик", uz: "Qoralama", en: "Draft" }, tone: "neutral" },
  APPROVED: { label: { ru: "Одобрен", uz: "Tasdiqlangan", en: "Approved" }, tone: "success" },
  DECLINED: { label: { ru: "Отклонён", uz: "Rad etilgan", en: "Declined" }, tone: "danger" },
};

export function AuctionStatusBadge({
  status,
  lang = "ru",
}: {
  status?: string;
  lang?: "ru" | "uz" | "en";
}) {
  const upper = String(status ?? "").toUpperCase();
  const item = STATUS_MAP[upper];
  if (!item) {
    return <StatusBadge tone="neutral">{status || "—"}</StatusBadge>;
  }
  return (
    <StatusBadge tone={item.tone}>
      {item.label[lang] ?? item.label.ru}
    </StatusBadge>
  );
}

