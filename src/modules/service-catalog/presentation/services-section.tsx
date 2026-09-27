import {
  ArrowUpRight,
  Package,
  PaintRoller,
  PanelsTopLeft,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { AnchorButton } from "@/shared/ui/anchor-button";
import { Container } from "@/shared/ui/container";
import { SectionHeading } from "@/shared/ui/section-heading";
import type { Service, ServiceId } from "../domain/service";

const serviceIcons: Record<ServiceId, LucideIcon> = {
  products: Package,
  handyman: Wrench,
  "kitchen-cabinet-painting": PanelsTopLeft,
  painting: PaintRoller,
};

export function ServicesSection({ services }: { services: readonly Service[] }) {
  return (
    <section id="services" tabIndex={-1} aria-labelledby="services-title" className="pt-8 pb-12 sm:pt-12 sm:pb-16">
      <Container>
        <SectionHeading
          id="services-title"
          as="h1"
          description="Home maintenance, painting and care for existing spaces."
        >
          Our services
        </SectionHeading>
        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = serviceIcons[service.id];

            return (
              <article key={service.id} className="flex flex-col items-center rounded-md border border-border px-6 pt-8 pb-7 text-center">
                <Icon aria-hidden="true" className="h-16 w-16" strokeWidth={1.25} />
                <h2 className="mt-6 flex min-h-14 items-center justify-center text-xl font-semibold leading-7">
                  {service.name}
                </h2>
                <p className="mt-3 mb-7 text-base leading-7 text-muted">
                  {service.description}
                </p>
                <AnchorButton
                  href="#contact"
                  aria-label={`Contact information for ${service.name}`}
                  className="mt-auto w-full"
                >
                  Contact information
                  <ArrowUpRight aria-hidden="true" size={16} />
                </AnchorButton>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
