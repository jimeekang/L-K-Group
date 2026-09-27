import Image from "next/image";
import { siteAssets } from "@/shared/config/assets";
import { getNavigationItems, siteRoutes } from "@/shared/config/navigation";
import { siteConfig } from "@/shared/config/site";
import { Container } from "@/shared/ui/container";
import { companyContent } from "../content/company-content";
import { MobileMenu } from "./mobile-menu";

const navLinkClass = "inline-flex min-h-11 items-center py-2 text-sm font-medium underline-offset-8 hover:underline xl:text-base";

export function CompanyHeader({ isHomePage = true }: { isHomePage?: boolean }) {
  const { wordmark } = siteAssets;
  const navigationItems = getNavigationItems(isHomePage);

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
          <a href={isHomePage ? "#home" : siteRoutes.home} aria-label="L&K Group — Home" className="col-start-2 row-start-1 flex flex-col items-center gap-2 rounded-sm">
            <Image
              src={wordmark.src}
              alt={wordmark.alt}
              width={wordmark.width}
              height={wordmark.height}
              sizes="(min-width: 1024px) 128px, (min-width: 640px) 104px, 96px"
              className="h-auto w-24 sm:w-[104px] lg:w-32"
              preload={isHomePage}
            />
            <span className="text-lg leading-6 font-semibold tracking-tight sm:text-xl">{siteConfig.name}</span>
          </a>
          <nav aria-label="More navigation" className="col-start-3 row-start-1 hidden items-center justify-end gap-5 lg:flex xl:gap-8">
            {navigationItems.slice(3).map((item) => (
              <a key={item.href} href={item.href} className={navLinkClass}>{item.label}</a>
            ))}
          </nav>
          <MobileMenu items={navigationItems} />
        </div>
        <p className="mt-3 text-center text-[10px] leading-5 font-medium tracking-[0.17em] text-muted uppercase sm:text-xs sm:tracking-[0.24em]">
          {companyContent.tagline}
        </p>
      </Container>
    </header>
  );
}
