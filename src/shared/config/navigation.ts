export const siteRoutes = {
  home: "/",
  cabinetPainting: "/services/cabinet-painting",
  cabinetQuote: "/quote/start?service=cabinet-painting",
} as const;

export type NavigationItem = Readonly<{
  label: string;
  href: string;
}>;

const navigationItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
] as const;

export function getNavigationItems(isHomePage: boolean): readonly NavigationItem[] {
  return navigationItems.map((item) => ({
    ...item,
    href: isHomePage ? item.href : `${siteRoutes.home}${item.href}`,
  }));
}
