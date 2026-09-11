"use client";

import React from "react";
import Link from "next/link";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-surface-muted p-8 text-center sm:p-12 ${className}`}
    >
      {icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-champagne-500/20 text-brand-gold-text">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-lg font-bold text-text-primary">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-text-secondary">
          {description}
        </p>
      ) : null}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-brand-navy-900 px-5 py-2 text-sm font-bold text-white shadow-button transition-transform hover:-translate-y-0.5 hover:bg-brand-navy-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
