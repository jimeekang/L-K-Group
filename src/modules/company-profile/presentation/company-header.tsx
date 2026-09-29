import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { siteAssets } from "@/shared/config/assets";
import { getNavigationItems, siteRoutes } from "@/shared/config/navigation";
import { siteConfig } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { companyContent } from "../content/company-content";
import { MobileMenu } from "./mobile-menu";

const prototypeLinkClass = "inline-flex min-h-11 items-center py-2 text-sm font-medium underline-offset-8 hover:underline xl:text-base";
const photoLinkClass = "inline-flex min-h-12 items-center text-nav underline-offset-8 hover:underline";

export function CompanyHeader({
  isHomePage = true,
  overlayPhotoHero = false,
}: {
  isHomePage?: boolean;
  overlayPhotoHero?: boolean;
}) {
  const { wordmark } = siteAssets;
  const navigationItems = getNavigationItems(isHomePage);

  if (!overlayPhotoHero) {
    return (
      <header id="home" tabIndex={-1} className="pt-6 pb-5 sm:pt-8">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Container>
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 lg:gap-5">
            <nav aria-label="Primary navigation" className="col-start-1 row-start-1 hidden items-center gap-5 lg:flex xl:gap-8">
              {navigationItems.slice(0, 3).map((item) => (
                <a key={item.href} href={item.href} className={prototypeLinkClass}>{item.label}</a>
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
                <a key={item.href} href={item.href} className={prototypeLinkClass}>{item.label}</a>
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

  const processLink = { label: "Our process", href: "#cabinet-process" };
  const desktopItems = [
    ...navigationItems.filter((item) => item.label === "Services"),
    processLink,
    ...navigationItems.filter((item) => item.label === "About" || item.label === "Contact"),
  ];
  const mobileItems = [
    ...navigationItems.filter((item) => item.label === "Home" || item.label === "Services"),
    processLink,
    ...navigationItems.filter((item) => item.label === "About" || item.label === "Gallery" || item.label === "Contact"),
  ];

  return (
    <header id="home" tabIndex={-1} className="absolute inset-x-0 top-0 z-20 py-4 sm:py-5">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Container>
        <div className="relative flex items-center justify-between gap-4 lg:gap-8">
          <a href={siteRoutes.home} aria-label="L&K Group — Home" className="flex min-w-0 items-center gap-3 rounded-sm sm:gap-4">
            <Image
              src={wordmark.src}
              alt={wordmark.alt}
              width={wordmark.width}
              height={wordmark.height}
              sizes="(min-width: 1024px) 80px, (min-width: 640px) 64px, 56px"
              className="h-14 w-14 shrink-0 rounded-full object-contain sm:h-16 sm:w-16 lg:h-20 lg:w-20"
              preload
            />
            <span className="min-w-0">
              <span className="block text-lg leading-6 font-bold tracking-tight sm:text-xl lg:text-2xl">{siteConfig.name}</span>
              <span className="mt-1 block text-[0.56rem] leading-4 font-semibold tracking-[0.2em] uppercase sm:text-[0.62rem]">
                {companyContent.tagline}
              </span>
            </span>
          </a>
          <nav aria-label="Primary navigation" className="hidden items-center gap-6 lg:flex xl:gap-8">
            {desktopItems.map((item) => (
              <a key={item.href} href={item.href} className={photoLinkClass}>{item.label}</a>
            ))}
          </nav>
          <div className="hidden lg:block">
            <Button variant="outline" disabled aria-describedby="hero-quote-status" className="cabinet-header-quote min-h-12 gap-5 px-7">
              Free quote <ArrowRight size={19} aria-hidden="true" />
            </Button>
          </div>
          <MobileMenu items={mobileItems} photo />
        </div>
      </Container>
    </header>
  );
}
