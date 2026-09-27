import type { Metadata } from "next";
import {
  AboutSection,
  BenefitsSection,
  CompanyFooter,
  CompanyHeader,
  ContactSection,
  companyContent,
} from "@/modules/company-profile";
import { getServices, ServicesSection } from "@/modules/service-catalog";
import { GallerySection } from "@/modules/showcase";
import { siteConfig } from "@/shared/config/site";

export const metadata: Metadata = {
  title: companyContent.home.title,
  description: companyContent.home.description,
  openGraph: {
    title: companyContent.home.title,
    description: companyContent.home.description,
    siteName: siteConfig.name,
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: companyContent.home.title,
    description: companyContent.home.description,
  },
};

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
