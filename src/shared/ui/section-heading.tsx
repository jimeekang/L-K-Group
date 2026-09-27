import type { ReactNode } from "react";

type SectionHeadingProps = {
  id?: string;
  as?: "h1" | "h2";
  children: ReactNode;
  description?: string;
};

export function SectionHeading({
  id,
  as: Heading = "h2",
  children,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-5xl text-center">
      <div className="flex items-center gap-4 sm:gap-8">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <Heading id={id} className={Heading === "h1"
          ? "max-w-3xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
          : "text-2xl font-semibold tracking-[0.12em] uppercase sm:text-3xl"}>
          {children}
        </Heading>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
      {description ? (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
