"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Briefcase, DollarSign, ExternalLink, Home, LogOut, MoreHorizontal, Palette, Settings, User, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ROOT = "/dashboard/creator";
const MAIN = [
  { href: ROOT, label: "Home", icon: Home, exact: true },
  { href: `${ROOT}/profile`, label: "Profile", icon: User },
  { href: `${ROOT}/works`, label: "Works", icon: Briefcase },
  { href: `${ROOT}/pricing`, label: "Pricing", icon: DollarSign },
] as const;
const MORE = [
  { href: `${ROOT}/appearance`, label: "Appearance", icon: Palette },
  { href: `${ROOT}/guide`, label: "Creator Guide", icon: BookOpen },
  { href: `${ROOT}/settings`, label: "Settings", icon: Settings },
] as const;

type Item = { href: string; label: string; icon: typeof Home; exact?: boolean };

function isActive(pathname: string, item: Item) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Phones: fixed bottom tab bar (Home · Profile · Works · Pricing · More). "More" opens a sheet with
 * Appearance, Guide, Settings, View page and Sign out. Wider screens: one row of pills at the top.
 * The sheet is rendered into <body> (portal) so no ancestor can clip or re-position it.
 */
export function CreatorNav({ username }: { username: string }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const moreActive = MORE.some((m) => isActive(pathname, m));
  const tab = "flex h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors";

  return (
    <>
      {/* wide screens */}
      <nav aria-label="Creator dashboard" className="no-scrollbar hidden gap-2 overflow-x-auto px-4 pt-4 md:flex">
        {[...MAIN, ...MORE].map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors",
                active ? "border-brand bg-brand text-white" : "border-brand-light/80 bg-white hover:bg-brand-light/25"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* phones */}
      <nav
        aria-label="Creator dashboard"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-brand-light/70 bg-white md:hidden"
      >
        <div className="mx-auto flex max-w-3xl">
          {MAIN.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(tab, active ? "text-brand-deep" : "text-gray-600")}
              >
                <item.icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.6 : 2} />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-haspopup="dialog"
            className={cn(tab, moreActive ? "text-brand-deep" : "text-gray-600")}
          >
            <MoreHorizontal className="h-[22px] w-[22px]" strokeWidth={moreActive ? 2.6 : 2} />
            More
          </button>
        </div>
      </nav>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] md:hidden">
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40" />
            <div
              role="dialog"
              aria-label="More"
              className="pb-safe absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-3 text-brand-ink shadow-2xl"
            >
              <div className="mb-1 flex items-center justify-between px-3 pt-1">
                <span className="text-sm font-extrabold">More</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-brand-light/30"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col">
                {MORE.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold hover:bg-brand-light/25"
                  >
                    <item.icon className="h-5 w-5 text-brand-deep" />
                    {item.label}
                  </Link>
                ))}
                <Link
                  href={`/${username}`}
                  target="_blank"
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold hover:bg-brand-light/25"
                >
                  <ExternalLink className="h-5 w-5 text-brand-deep" />
                  View my public page
                </Link>
                <form action="/auth/signout" method="post">
                  <input type="hidden" name="to" value="login" />
                  <button
                    type="submit"
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
