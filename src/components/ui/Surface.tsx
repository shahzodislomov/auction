import type { HTMLAttributes } from "react";

type SurfaceTone = "primary" | "muted" | "navy";
type SurfacePadding = "none" | "small" | "medium" | "large";

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  padding?: SurfacePadding;
}

const toneClasses: Record<SurfaceTone, string> = {
  primary: "border-border-default bg-surface-primary text-text-primary",
  muted: "border-border-default bg-surface-muted text-text-primary",
  navy: "border-brand-navy-800 bg-brand-navy-900 text-white",
};

const paddingClasses: Record<SurfacePadding, string> = {
  none: "",
  small: "p-4",
  medium: "p-5 md:p-6",
  large: "p-6 md:p-8",
};

export function Surface({
  children,
  className = "",
  padding = "medium",
  tone = "primary",
  ...props
}: SurfaceProps) {
  return (
    <div
      className={[
        "rounded-lg border",
        toneClasses[tone],
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
