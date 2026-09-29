import type { ReactNode } from "react";

type SectionHeadingProps = {
  id?: string;
  as?: "h1" | "h2";
  align?: "center" | "left";
  children: ReactNode;
  description?: string;
};

export function SectionHeading({
  id,
  as: Heading = "h2",
  align = "center",
  children,
  description,
}: SectionHeadingProps) {
  return (
    <div className={`max-w-5xl ${align === "center" ? "mx-auto text-center" : "text-left"}`}>
      <div className="flex items-center gap-4 sm:gap-8">
        {align === "center" ? <span className="h-px flex-1 bg-border" aria-hidden="true" /> : null}
        <Heading id={id} className={Heading === "h1" ? "text-page-title" : "text-section-title"}>
          {children}
        </Heading>
        {align === "center" ? <span className="h-px flex-1 bg-border" aria-hidden="true" /> : null}
      </div>
      {description ? (
        <p className={`mt-4 max-w-2xl text-body text-muted ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
