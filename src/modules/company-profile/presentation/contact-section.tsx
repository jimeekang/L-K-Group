import { Container } from "@/shared/ui/container";
import { companyContent } from "../content/company-content";

export function ContactSection() {
  const { contact } = companyContent;

  return (
    <section id="contact" tabIndex={-1} aria-labelledby="contact-title" className="py-16 sm:py-20">
      <Container>
        <div className="rounded-md border border-border bg-surface px-6 py-10 text-center sm:px-12 sm:py-12">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Contact {contact.person}</p>
          <h2 id="contact-title" className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{contact.heading}</h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7">{contact.message}</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">{contact.nextStep}</p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <a href={contact.phoneHref} className="inline-flex min-h-11 items-center rounded-sm px-3 text-xl font-semibold underline underline-offset-4" aria-label={`Call ${contact.person} on ${contact.phone}`}>{contact.phone}</a>
            <a href={contact.emailHref} className="inline-flex min-h-11 max-w-full items-center rounded-sm text-base break-all underline underline-offset-4">{contact.email}</a>
          </div>
          <p className="mt-6 text-sm leading-6 text-muted">{contact.hours}</p>
          <p className="mt-2 text-sm leading-6 text-muted">Based in {contact.locality}</p>
          <a href={contact.instagram.href} className="mt-3 inline-flex min-h-11 items-center text-sm underline underline-offset-4">Instagram {contact.instagram.label}</a>
        </div>
      </Container>
    </section>
  );
}
