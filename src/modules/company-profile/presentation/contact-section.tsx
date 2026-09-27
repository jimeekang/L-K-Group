import { Container } from "@/shared/ui/container";
import { companyContent } from "../content/company-content";

export function ContactSection() {
  const { contact } = companyContent;

  return (
    <section id="contact" tabIndex={-1} aria-labelledby="contact-title" className="py-16 sm:py-20">
      <Container>
        <div className="rounded-md border border-border bg-surface px-6 py-10 text-center sm:px-12 sm:py-12">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Contact details pending</p>
          <h2 id="contact-title" className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{contact.heading}</h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7">{contact.message}</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">{contact.nextStep}</p>
        </div>
      </Container>
    </section>
  );
}
