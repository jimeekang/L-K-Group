import type { ComponentPropsWithoutRef } from "react";

export function AnchorButton({
  children,
  className = "",
  variant = "outline",
  ...props
}: ComponentPropsWithoutRef<"a"> & { variant?: "primary" | "outline" | "text" }) {
  const variantClass = {
    primary: "border-action bg-action text-on-action hover:bg-action-hover hover:border-action-hover",
    outline: "border-border-strong text-foreground hover:bg-action hover:text-on-action",
    text: "border-transparent text-foreground underline underline-offset-8 hover:text-muted",
  }[variant];

  return (
    <a
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 py-3 text-button transition-colors duration-(--motion-fast) ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
