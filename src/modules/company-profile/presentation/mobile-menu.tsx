"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavigationItem } from "@/shared/config/navigation";
import { siteRoutes } from "@/shared/config/navigation";

export function MobileMenu({ items, photo = false }: { items: readonly NavigationItem[]; photo?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    const desktopQuery = window.matchMedia("(min-width: 64rem)");
    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) setIsOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      desktopQuery.removeEventListener("change", closeOnDesktop);
    };
  }, [isOpen]);

  function navigateToSection(href: string) {
    setIsOpen(false);
    if (href.startsWith("#")) {
      document.getElementById(href.slice(1))?.focus({ preventScroll: true });
    }
  }

  return (
    <div className="col-start-3 row-start-1 justify-self-end lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        className={photo
          ? "flex h-12 w-12 items-center justify-center rounded-full border border-border-strong bg-surface/80 hover:bg-surface"
          : "flex h-11 w-11 items-center justify-center rounded-sm border border-border hover:bg-surface"}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
      </button>
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!isOpen}
        className={photo
          ? "absolute top-full right-0 left-0 z-30 border border-border bg-surface p-3 shadow-lg"
          : "absolute top-full right-0 left-0 z-30 border border-border bg-background p-3 shadow-sm"}
      >
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={photo
              ? "flex min-h-12 items-center rounded-sm px-4 py-3 text-nav hover:bg-background"
              : "block rounded-sm px-4 py-3 text-base font-medium hover:bg-surface"}
            onClick={() => navigateToSection(item.href)}
          >
            {item.label}
          </a>
        ))}
        {photo && <a href={siteRoutes.cabinetQuote} className="flex min-h-12 items-center rounded-sm bg-action px-4 py-3 font-semibold text-on-action" onClick={() => setIsOpen(false)}>Request a quote</a>}
      </nav>
    </div>
  );
}
