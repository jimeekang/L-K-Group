import type { ComponentPropsWithoutRef } from "react";

export function Container({
  children,
  className = "",
  width = "wide",
  ...props
}: ComponentPropsWithoutRef<"div"> & { width?: "wide" | "content" | "narrow" }) {
  const maxWidth = {
    wide: "max-w-[var(--container-wide)]",
    content: "max-w-[var(--container-content)]",
    narrow: "max-w-[var(--container-narrow)]",
  }[width];

  return (
    <div className={`mx-auto w-full px-5 sm:px-8 lg:px-12 2xl:px-16 ${maxWidth} ${className}`} {...props}>
      {children}
    </div>
  );
}
