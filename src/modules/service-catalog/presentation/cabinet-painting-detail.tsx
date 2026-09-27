import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronRight,
  ListChecks,
  MapPin,
  PaintRoller,
  Paintbrush,
  Palette,
  PanelsTopLeft,
  Plus,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { siteAssets } from "@/shared/config/assets";
import { siteRoutes } from "@/shared/config/navigation";
import { AnchorButton } from "@/shared/ui/anchor-button";
import { Container } from "@/shared/ui/container";
import { cabinetPaintingContent as content } from "../content/cabinet-painting-content";

const categoryIcons: Record<(typeof content.categories)[number]["id"], LucideIcon> = {
  "full-repainting": PaintRoller,
  "partial-touch-ups": Wrench,
  "colour-changes": Palette,
  "doors-drawers": Paintbrush,
  "frames-panels": PanelsTopLeft,
  "preparation-repairs": ListChecks,
};

const pageSections = [
  { href: "#cabinet-services", label: "Services" },
  { href: "#cabinet-suitability", label: "Suitable cabinets" },
  { href: "#cabinet-inclusions", label: "Included scope" },
  { href: "#cabinet-process", label: "Process" },
  { href: "#cabinet-service-area", label: "Service area" },
  { href: "#cabinet-examples", label: "Examples" },
  { href: "#cabinet-faq", label: "FAQs" },
  { href: "#cabinet-quote", label: "Quote status" },
] as const;

function DraftLabel() {
  return <p className="text-xs leading-5 font-medium text-muted">{content.draftLabel}</p>;
}

function DraftSectionHeading({ id, title, description }: { id: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl">
      <DraftLabel />
      <h2 id={id} className="mt-3 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {description ? <p className="mt-5 text-base leading-7 text-muted">{description}</p> : null}
    </div>
  );
}

function ConfirmationNote({ children }: { children: string }) {
  return <p className="text-sm leading-6 font-medium text-muted">{children}</p>;
}

function FreeQuoteButton({ descriptionId }: { descriptionId: string }) {
  return (
    <button
      type="button"
      disabled
      aria-describedby={descriptionId}
      className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-sm border border-border bg-[#e8e6e1] px-5 py-2.5 text-sm font-semibold text-muted"
    >
      {content.quoteLabel}
    </button>
  );
}

export function CabinetPaintingDetail() {
  const { kitchen, cabinetFinish } = siteAssets;

  return (
    <>
      <aside aria-label="Draft content notice" className="border-t border-border bg-surface py-3">
        <Container><p className="max-w-5xl text-xs leading-5 text-muted sm:text-sm sm:leading-6">{content.previewNotice}</p></Container>
      </aside>
      <div className="border-y border-border bg-[#f7f5f0]">
        <Container>
          <nav aria-label="Breadcrumb" className="py-4">
            <ol className="flex flex-wrap items-center gap-x-2 text-xs text-muted sm:gap-x-3 sm:text-sm">
              <li><a href={siteRoutes.home} className="inline-flex min-h-11 min-w-11 items-center underline-offset-4 hover:underline">Home</a></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li><a href={`${siteRoutes.home}#services`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Services</a></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li aria-current="page" className="py-2 font-medium text-foreground">{content.serviceName}</li>
            </ol>
          </nav>
          <section id="cabinet-overview" tabIndex={-1} aria-labelledby="cabinet-title" className="grid items-center gap-9 pt-3 pb-10 sm:pb-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:pt-5 lg:pb-16">
            <div className="min-w-0">
              <p className="text-xs leading-6 font-semibold tracking-[0.12em] text-muted uppercase">{content.locationLabel}</p>
              <h1 id="cabinet-title" className="mt-4 max-w-xl text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl xl:text-6xl">{content.title}</h1>
              <div className="mt-4"><DraftLabel /></div>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{content.introduction}</p>
              <p className="mt-4 max-w-lg text-sm leading-6 text-muted">{content.scope}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <FreeQuoteButton descriptionId="hero-quote-status" />
                <AnchorButton href="#cabinet-services">View services <ArrowDown size={16} aria-hidden="true" /></AnchorButton>
              </div>
              <p id="hero-quote-status" className="mt-3 max-w-md text-xs leading-5 text-muted">{content.quoteStatus}</p>
            </div>
            <figure className="min-w-0">
              <Image
                src={kitchen.src}
                alt={kitchen.alt}
                width={kitchen.width}
                height={kitchen.height}
                sizes="(min-width: 1280px) 643px, (min-width: 1024px) calc((100vw - 112px) * 0.55), (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
                className="aspect-3/2 h-auto w-full rounded-sm object-cover"
                preload
              />
              <figcaption className="mt-3 text-xs leading-5 text-muted">{content.conceptCaption}</figcaption>
            </figure>
          </section>
        </Container>
      </div>

      <nav aria-label="On this page" className="border-b border-border py-5 sm:py-6">
        <Container>
          <p className="mb-2 text-sm leading-6 font-semibold text-muted sm:text-base">On this page</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-8">
            {pageSections.map((section) => (
              <li key={section.href}><a href={section.href} className="inline-flex min-h-12 min-w-11 items-center text-lg leading-7 font-semibold underline-offset-4 hover:underline sm:text-xl">{section.label}</a></li>
            ))}
          </ul>
        </Container>
      </nav>

      <section id="cabinet-services" tabIndex={-1} aria-labelledby="cabinet-services-title" className="py-14 sm:py-20">
        <Container>
          <DraftSectionHeading id="cabinet-services-title" title={content.categoriesTitle} description={content.categoriesIntroduction} />
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{content.categoriesNotice}</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {content.categories.map((category) => {
              const Icon = categoryIcons[category.id];
              return (
                <article key={category.id} className="rounded-md border border-border p-6 sm:p-7">
                  <Icon aria-hidden="true" size={32} strokeWidth={1.5} />
                  <p className="mt-5 text-xs leading-5 font-medium text-muted">{category.kind}</p>
                  <h3 className="mt-2 text-xl leading-7 font-semibold">{category.title}</h3>
                  <p className="mt-4 text-base leading-7 text-muted">{category.description}</p>
                  <ul className="mt-5 list-disc space-y-2 border-t border-border pt-5 pl-5 text-sm leading-6 text-muted">
                    {category.notes.map((note) => <li key={note}>{note}</li>)}
                  </ul>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="cabinet-suitability" tabIndex={-1} aria-labelledby="cabinet-suitability-title" className="bg-surface py-14 sm:py-20">
        <Container>
          <DraftSectionHeading id="cabinet-suitability-title" title={content.suitability.title} description={content.suitability.introduction} />
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {content.suitability.items.map((item) => (
              <article key={item.title}>
                <h3 className="text-xl leading-7 font-semibold">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-muted">{item.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 border-t border-border pt-6">
            <ConfirmationNote>{content.suitability.confirmation}</ConfirmationNote>
            {content.suitability.sources.map((source) => (
              <a key={source.href} href={source.href} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm leading-6 underline underline-offset-4">
                {source.label}<ArrowUpRight size={16} aria-hidden="true" className="shrink-0" />
              </a>
            ))}
            <p className="max-w-2xl text-xs leading-5 text-muted">{content.suitability.sourcesNote}</p>
          </div>
        </Container>
      </section>

      <section id="cabinet-inclusions" tabIndex={-1} aria-labelledby="cabinet-inclusions-title" className="py-14 sm:py-20">
        <Container>
          <DraftSectionHeading id="cabinet-inclusions-title" title={content.inclusions.title} description={content.inclusions.introduction} />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[
              { title: content.inclusions.includedTitle, items: content.inclusions.included },
              { title: content.inclusions.excludedTitle, items: content.inclusions.excluded },
            ].map((column) => (
              <div key={column.title} className="rounded-md border border-border p-6 sm:p-8">
                <h3 className="text-xl leading-7 font-semibold">{column.title}</h3>
                <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-7 text-muted">
                  {column.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6"><ConfirmationNote>{content.inclusions.confirmation}</ConfirmationNote></div>
        </Container>
      </section>

      <section id="cabinet-process" tabIndex={-1} aria-labelledby="cabinet-process-title" className="bg-surface py-14 sm:py-20">
        <Container>
          <DraftSectionHeading id="cabinet-process-title" title={content.process.title} description={content.process.introduction} />
          <ol className="mt-9 grid gap-8 sm:grid-cols-2 xl:grid-cols-5">
            {content.process.steps.map((step, index) => (
              <li key={step.title}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm font-semibold" aria-hidden="true">{index + 1}</span>
                <h3 className="mt-4 text-lg leading-7 font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-9 space-y-2 border-t border-border pt-6">
            {content.process.confirmations.map((confirmation) => <ConfirmationNote key={confirmation}>{confirmation}</ConfirmationNote>)}
          </div>
        </Container>
      </section>

      <section id="cabinet-service-area" tabIndex={-1} aria-labelledby="cabinet-service-area-title" className="py-14 sm:py-20">
        <Container>
          <DraftSectionHeading id="cabinet-service-area-title" title={content.serviceArea.title} description={content.serviceArea.introduction} />
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{content.serviceArea.guidance}</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
            <div className="rounded-md border border-border bg-[#f7f5f0] p-6 sm:p-8">
              <MapPin size={28} strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-4 text-4xl font-semibold tracking-tight">{content.serviceArea.radiusLabel}</p>
              <p className="mt-2 text-base leading-7 font-medium">{content.serviceArea.radiusDescription}</p>
              <p className="mt-5 text-sm leading-6 text-muted">{content.serviceArea.addressNote}</p>
              <a href={content.serviceArea.mapLink.href} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm leading-6 font-medium underline underline-offset-4">
                {content.serviceArea.mapLink.label}<ArrowUpRight size={16} aria-hidden="true" className="shrink-0" />
              </a>
            </div>
            <div>
              <div className="grid gap-7 sm:grid-cols-2">
                {content.serviceArea.groups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-lg leading-7 font-semibold">{group.title}</h3>
                    <p className="mt-3 text-base leading-7 text-muted">{group.suburbs.join(", ")}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7 border-t border-border pt-5">
                <p className="mb-3 text-sm leading-6 text-muted">{content.serviceArea.boundaryNote}</p>
                <ConfirmationNote>{content.serviceArea.confirmation}</ConfirmationNote>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="cabinet-examples" tabIndex={-1} aria-labelledby="cabinet-examples-title" className="bg-surface py-14 sm:py-20">
        <Container>
          <DraftSectionHeading id="cabinet-examples-title" title={content.examples.title} description={content.examples.introduction} />
          <div className="mt-8 grid items-center gap-9 lg:grid-cols-2 lg:gap-14">
            <figure className="min-w-0">
              <Image
                src={cabinetFinish.src}
                alt={cabinetFinish.alt}
                width={cabinetFinish.width}
                height={cabinetFinish.height}
                sizes="(min-width: 1280px) 580px, (min-width: 1024px) calc((100vw - 120px) / 2), (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
                className="aspect-3/2 h-auto w-full rounded-sm object-cover"
                loading="lazy"
              />
              <figcaption className="mt-3 text-xs leading-5 text-muted">{content.examples.caption}</figcaption>
            </figure>
            <div className="min-w-0">
              <p className="text-xs leading-5 font-semibold tracking-[0.12em] text-muted uppercase">{content.examples.briefLabel}</p>
              <h3 className="mt-3 text-2xl leading-8 font-semibold">{content.examples.briefTitle}</h3>
              <p className="mt-4 text-base leading-7 text-muted">{content.examples.briefDescription}</p>
              <dl className="mt-6 space-y-4 border-t border-border pt-5">
                {content.examples.details.map((item) => (
                  <div key={item.label}>
                    <dt className="text-sm leading-6 font-semibold">{item.label}</dt>
                    <dd className="mt-1 text-sm leading-6 text-muted">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="mt-8 rounded-md border border-border p-6">
            <h3 className="text-lg leading-7 font-semibold">{content.examples.photosStatus}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{content.examples.photosDescription}</p>
          </div>
        </Container>
      </section>

      <section id="cabinet-faq" tabIndex={-1} aria-labelledby="cabinet-faq-title" className="py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <DraftSectionHeading id="cabinet-faq-title" title={content.faqTitle} />
            <div className="mt-8 border-t border-border">
              {content.faqs.map((faq) => (
                <details key={faq.question} className="group border-b border-border">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-5 text-base leading-7 font-semibold [&::-webkit-details-marker]:hidden">
                    {faq.question}<Plus aria-hidden="true" size={20} className="shrink-0 group-open:rotate-45" />
                  </summary>
                  <p className="max-w-2xl pb-6 text-base leading-7 text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="cabinet-quote" tabIndex={-1} aria-labelledby="cabinet-quote-title" className="pb-14 sm:pb-20">
        <Container>
          <div className="rounded-md border border-border bg-[#f7f5f0] p-6 sm:p-10">
            <DraftSectionHeading id="cabinet-quote-title" title={content.closing.title} description={content.closing.description} />
            <p id="closing-quote-status" className="mt-5 max-w-xl text-sm leading-6 text-muted">{content.quoteStatus}</p>
            <div className="mt-4"><FreeQuoteButton descriptionId="closing-quote-status" /></div>
            <div className="mt-4"><ConfirmationNote>{content.closing.confirmation}</ConfirmationNote></div>
          </div>
        </Container>
      </section>
    </>
  );
}
