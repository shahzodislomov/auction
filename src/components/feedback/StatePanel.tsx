import type { ReactNode } from "react";

import { Surface } from "@/components/ui/Surface";

export interface StatePanelProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  live?: "off" | "polite" | "assertive";
  className?: string;
}

export function StatePanel({
  action,
  className = "",
  description,
  icon,
  live = "polite",
  title,
}: StatePanelProps) {
  return (
    <Surface
      aria-live={live}
      className={`mx-auto flex min-h-48 max-w-2xl flex-col items-center justify-center text-center ${className}`}
    >
      {icon ? (
        <span aria-hidden="true" className="mb-4 text-brand-gold-text">
          {icon}
        </span>
      ) : null}
      <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-prose text-sm leading-6 text-text-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </Surface>
  );
}
