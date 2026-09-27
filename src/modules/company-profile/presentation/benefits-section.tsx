import { House, PaintRoller, Wrench } from "lucide-react";
import { Container } from "@/shared/ui/container";
import { companyContent } from "../content/company-content";

const benefitIcons = {
  experience: PaintRoller,
  preparation: House,
  services: Wrench,
};

export function BenefitsSection() {
  return (
    <section aria-label="Why choose L&K Group">
      <Container>
        <div className="grid gap-8 border-y border-border py-8 md:grid-cols-3 md:gap-0">
          {companyContent.benefits.map((benefit) => {
            const Icon = benefitIcons[benefit.id];
            return (
              <div key={benefit.id} className="flex gap-4 md:px-6 md:not-first:border-l md:not-first:border-border md:first:pl-0 md:last:pr-0">
                <Icon className="mt-1 h-9 w-9 shrink-0" strokeWidth={1.4} aria-hidden="true" />
                <div>
                  <h2 className="text-base font-semibold">{benefit.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
