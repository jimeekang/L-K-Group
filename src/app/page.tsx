import {
  AboutSection,
  BenefitsSection,
  CompanyFooter,
  CompanyHeader,
  ContactSection,
} from "@/modules/company-profile";
import { getServices, ServicesSection } from "@/modules/service-catalog";
import { GallerySection } from "@/modules/showcase";

export default function HomePage() {
  const services = getServices();

  return (
    <>
      <CompanyHeader />
      <main id="main-content" tabIndex={-1}>
        <ServicesSection services={services} />
        <BenefitsSection />
        <AboutSection />
        <GallerySection />
        <ContactSection />
      </main>
      <CompanyFooter />
    </>
  );
}
