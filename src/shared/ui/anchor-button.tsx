import type { ComponentPropsWithoutRef } from "react";

export function AnchorButton({
  children,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-foreground px-4 py-2.5 text-sm font-semibold hover:bg-foreground hover:text-background ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
