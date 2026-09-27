import Image from "next/image";
import { siteAssets } from "@/shared/config/assets";
import { navigationItems } from "@/shared/config/navigation";
import { Container } from "@/shared/ui/container";
import { companyContent } from "../content/company-content";
import { MobileMenu } from "./mobile-menu";

const navLinkClass = "inline-flex min-h-11 items-center py-2 text-sm font-medium underline-offset-8 hover:underline xl:text-base";

export function CompanyHeader() {
  const { wordmark } = siteAssets;

  return (
    <header id="home" tabIndex={-1} className="pt-6 pb-5 sm:pt-8">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Container>
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 lg:gap-5">
          <nav aria-label="Primary navigation" className="col-start-1 row-start-1 hidden items-center gap-5 lg:flex xl:gap-8">
            {navigationItems.slice(0, 3).map((item) => (
              <a key={item.href} href={item.href} className={navLinkClass}>{item.label}</a>
            ))}
          </nav>
          <a href="#home" aria-label="L&K Group — Home" className="col-start-2 row-start-1 rounded-sm">
            <Image
              src={wordmark.src}
              alt={wordmark.alt}
              width={wordmark.width}
              height={wordmark.height}
              sizes="(min-width: 1280px) 400px, (min-width: 1024px) 340px, (min-width: 640px) 280px, 180px"
              className="h-auto w-[180px] sm:w-[280px] lg:w-[340px] xl:w-[400px]"
              preload
            />
          </a>
          <nav aria-label="More navigation" className="col-start-3 row-start-1 hidden items-center justify-end gap-5 lg:flex xl:gap-8">
            {navigationItems.slice(3).map((item) => (
              <a key={item.href} href={item.href} className={navLinkClass}>{item.label}</a>
            ))}
          </nav>
          <MobileMenu />
        </div>
        <p className="mt-3 text-center text-[10px] leading-5 font-medium tracking-[0.17em] text-muted uppercase sm:text-xs sm:tracking-[0.24em]">
          {companyContent.tagline}
        </p>
      </Container>
    </header>
  );
}
