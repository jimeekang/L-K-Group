import type { ComponentPropsWithoutRef } from "react";

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: "primary" | "outline" }) {
  const variantClass = variant === "primary"
    ? "border-action bg-action text-on-action enabled:hover:bg-action-hover enabled:hover:border-action-hover"
    : "border-border-strong text-foreground enabled:hover:bg-action enabled:hover:text-on-action";

  return (
    <button
      type={type}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 py-3 text-button transition-colors duration-(--motion-fast) disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-disabled-surface disabled:text-disabled-text ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
