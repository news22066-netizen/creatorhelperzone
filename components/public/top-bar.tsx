"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu as MenuIcon, X } from "lucide-react";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";
import { SiteLogo } from "./site-logo";
import { SocialLinks } from "./social-links";
import type { SiteSocialKey } from "@/types/database";
import { cn } from "../../lib/utils/cn";

type MenuLink = { href: string; label: string };

const menuGroups: { title: string; links: MenuLink[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/tools", label: "Tools" },
      { href: "/trending", label: "Trending" },
      { href: "/guides", label: "Guides" },
      { href: "/store", label: "Store" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Login" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
      { href: "/help", label: "Help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

// Desktop top nav keeps the original four.
const desktopLinks: MenuLink[] = [
  { href: "/tools", label: "Free Tools" },
  { href: "/trending", label: "Trending" },
  { href: "/guides", label: "Guides" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

const DRAWER_ID = "site-menu-drawer";

export function TopBar({
  logoUrl = "",
  socials = {},
}: {
  logoUrl?: string;
  socials?: Partial<Record<SiteSocialKey, string>>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  // Close whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape to close + simple focus trap.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Move focus into the drawer on open; return it to the trigger on close.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeRef.current?.focus();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-light/60 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-2 px-3 md:h-16 md:max-w-5xl md:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls={DRAWER_ID}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-sm transition-colors hover:bg-brand-hover active:scale-95"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <Link href="/" aria-label="BFEED home" className="flex min-w-0 items-center">
              <SiteLogo logoUrl={logoUrl} />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {desktopLinks.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-semibold",
                    active ? "bg-brand-light/40 text-brand-ink" : "text-gray-600 hover:text-brand-ink"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
            <Link
              href="/notifications"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-brand-ink hover:bg-brand-light/30"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Always mounted so the open/close can transition. Hidden from AT and focus when closed. */}
      <div
        className={cn("fixed inset-0 z-50", open ? "visible" : "invisible delay-200")}
        aria-hidden={!open}
        style={{ transitionProperty: "visibility" }}
      >
        <div
          onClick={close}
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-200 motion-reduce:transition-none",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          id={DRAWER_ID}
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "relative flex h-full w-80 max-w-[88vw] flex-col bg-surface shadow-xl transition-transform duration-200 ease-out motion-reduce:transition-none",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-brand-light/60 p-4">
            <SiteLogo logoUrl={logoUrl} compact />
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light/30 text-brand-ink hover:bg-brand-light/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Site menu" className="flex-1 overflow-y-auto overscroll-contain p-3 pb-safe">
            {menuGroups.map((group) => (
              <div key={group.title} className="mb-3">
                <p className="px-3 pb-1 pt-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  {group.title}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {group.links.map((l) => {
                    const active = isActive(l.href);
                    return (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-11 items-center justify-between rounded-xl px-3 text-[15px] font-semibold",
                            active
                              ? "bg-brand-light/40 text-brand-ink"
                              : "text-gray-700 hover:bg-brand-light/20"
                          )}
                        >
                          {l.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {Object.keys(socials).length > 0 && (
              <div className="mb-3">
                <p className="px-3 pb-1 pt-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  Follow us
                </p>
                <SocialLinks socials={socials} className="px-3" />
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
