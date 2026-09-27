import type { Metadata } from "next";
import { CompanyFooter, CompanyHeader } from "@/modules/company-profile";
import { CabinetPaintingDetail, cabinetPaintingContent } from "@/modules/service-catalog";
import { siteConfig } from "@/shared/config/site";

export const metadata: Metadata = {
  title: `${cabinetPaintingContent.title} | ${siteConfig.name} — Preview`,
  description: cabinetPaintingContent.metadataDescription,
};

export default function CabinetPaintingPage() {
  return (
    <>
      <CompanyHeader isHomePage={false} />
      <main id="main-content" tabIndex={-1}>
        <CabinetPaintingDetail />
      </main>
      <CompanyFooter isHomePage={false} />
    </>
  );
}
