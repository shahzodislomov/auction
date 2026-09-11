import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-brand-champagne-500 bg-brand-champagne-500 text-brand-navy-900 hover:border-brand-champagne-600 hover:bg-brand-champagne-600 hover:shadow-md active:scale-[0.99] cursor-pointer",
  secondary:
    "border-brand-navy-900 bg-brand-navy-900 text-white hover:border-brand-navy-800 hover:bg-brand-navy-800 hover:shadow-md active:scale-[0.99] cursor-pointer",
  outline:
    "border-border-default bg-surface-primary text-brand-navy-900 hover:border-brand-navy-900 hover:bg-surface-muted hover:shadow-sm active:scale-[0.99] cursor-pointer",
  ghost:
    "border-transparent bg-transparent text-brand-navy-900 hover:bg-surface-muted active:scale-[0.99] cursor-pointer",
  danger:
    "border-semantic-danger bg-semantic-danger text-white hover:border-brand-navy-950 hover:bg-brand-navy-950 hover:shadow-md active:scale-[0.99] cursor-pointer",
};

const sizeClasses: Record<ButtonSize, string> = {
  small: "min-h-11 px-4 py-2 text-sm",
  medium: "min-h-11 px-5 py-2.5 text-sm",
  large: "min-h-12 px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className = "",
    fullWidth = false,
    size = "medium",
    type = "button",
    variant = "primary",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md border font-bold",
        "transition-[background-color,border-color,color,opacity,transform] [transition-duration:var(--motion-fast)] [transition-timing-function:var(--ease-standard)]",
        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
});
