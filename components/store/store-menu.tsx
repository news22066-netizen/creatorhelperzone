"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MoreVertical, Phone, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { ShareButton } from "./share-button";
import { ToolsPromo } from "@/components/shared/tools-promo";

/**
 * The ⋮ (three-dot) menu of the business store header.
 *
 * Why a portal: the sticky header uses backdrop-blur. A CSS backdrop-filter makes the header the
 * containing block of every `position: fixed` child, so an overlay rendered INSIDE the header is sized
 * to the 56px header instead of the screen (menu cut off, taps missed on real phones). The panel is
 * therefore rendered into <body>. Because that leaves the themed wrapper, the store's colour variables
 * are re-applied on the portal root (`themeStyle`).
 *
 * Closes on: outside tap, ✕, Escape, any link, route change, scroll, resize / rotate.
 * Position is measured from the button at open time, and the panel never exceeds the viewport width.
 */
export function StoreMenu({
  username,
  displayName,
  shareUrl,
  themeStyle,
}: {
  username: string;
  displayName: string;
  shareUrl: string;
  themeStyle: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(60);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() ?? "";

  const close = () => setOpen(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onViewport = () => setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onViewport);
    window.addEventListener("orientationchange", onViewport);
    window.addEventListener("scroll", onViewport, { passive: true });
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onViewport);
      window.removeEventListener("orientationchange", onViewport);
      window.removeEventListener("scroll", onViewport);
    };
  }, [open]);

  function toggle() {
    if (!open) {
      const r = buttonRef.current?.getBoundingClientRect();
      setTop(Math.round((r?.bottom ?? 56) + 6));
    }
    setOpen((o) => !o);
  }

  const base = `/${username}`;
  const items = [
    { href: base, label: "Home", icon: Home },
    { href: `${base}/shop`, label: "Shop", icon: ShoppingBag },
    { href: `${base}/contact`, label: "Contact", icon: Phone },
    { href: `${base}/privacy`, label: "Privacy policy", icon: ShieldCheck },
  ];
  const row = "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-semibold hover:bg-store-text/10";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="store-more-menu"
        className="flex h-11 w-11 items-center justify-center rounded-full text-store-text transition-colors hover:bg-store-text/10"
      >
        <MoreVertical className="h-6 w-6" />
      </button>

      {open &&
        createPortal(
          <div style={themeStyle} className="fixed inset-0 z-[60]">
            <button type="button" aria-label="Close menu" onClick={close} className="absolute inset-0 cursor-default bg-black/40" />
            <div
              ref={panelRef}
              id="store-more-menu"
              role="dialog"
              aria-label={`${displayName} menu`}
              style={{ top, right: 8, width: "min(19rem, calc(100vw - 16px))", maxHeight: `calc(100dvh - ${top + 12}px)` }}
              className="absolute overflow-y-auto overscroll-contain rounded-2xl border border-store-text/15 bg-store-bg p-2 text-store-text shadow-2xl"
            >
              <div className="flex items-center justify-between px-3 pb-1 pt-1">
                <span className="truncate text-sm font-extrabold">{displayName}</span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-store-text/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col">
                {items.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} onClick={close} className={row}>
                    <Icon className="h-5 w-5 shrink-0 text-store-primary" />
                    {label}
                  </Link>
                ))}
                <ShareButton url={shareUrl} title={displayName} className={row}>
                  Share this store
                </ShareButton>
              </nav>

              <div className="mt-1 border-t border-store-text/10 pt-2">
                <ToolsPromo rounded />
              </div>
              <p className="px-3 pb-1 pt-2 text-xs text-store-text/70">
                Powered by{" "}
                <Link href="/" onClick={close} className="font-semibold underline">
                  CreatorHub BD
                </Link>
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
