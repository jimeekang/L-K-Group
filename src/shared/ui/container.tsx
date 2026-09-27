import type { ComponentPropsWithoutRef } from "react";

export function Container({
  children,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`} {...props}>
      {children}
    </div>
  );
}
