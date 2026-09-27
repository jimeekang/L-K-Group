import { companyContent } from "../content/company-content";
import { Container } from "@/shared/ui/container";

export function AboutSection() {
  return (
    <section id="about" tabIndex={-1} aria-labelledby="about-title" className="py-16 sm:py-20">
      <Container className="grid gap-8 md:grid-cols-2 md:gap-16">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">About L&K Group</p>
          <h2 id="about-title" className="mt-4 max-w-md text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {companyContent.about.heading}
          </h2>
        </div>
        <div className="space-y-5 text-base leading-8 text-muted">
          {companyContent.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </Container>
    </section>
  );
}
