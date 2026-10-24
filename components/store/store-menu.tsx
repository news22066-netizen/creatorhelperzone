"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, Phone, ShieldCheck, ShoppingBag, X } from "lucide-react";

/** Hamburger (left of the header in the Canva mock): slide-in menu with the store pages. */
export function StoreMenu({ username, displayName }: { username: string; displayName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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

  const base = `/${username}`;
  const items = [
    { href: base, label: "Home", icon: Home },
    { href: `${base}/shop`, label: "Shop", icon: ShoppingBag },
    { href: `${base}/contact`, label: "Contact", icon: Phone },
    { href: `${base}/privacy`, label: "Privacy policy", icon: ShieldCheck },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full text-store-text transition-colors hover:bg-store-text/10"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Store menu">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-store-bg text-store-text shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-store-text/10 px-4">
              <span className="truncate text-[15px] font-extrabold">{displayName}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-store-text/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col p-2">
              {items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold hover:bg-store-text/10"
                >
                  <Icon className="h-5 w-5 text-store-primary" />
                  {label}
                </Link>
              ))}
            </nav>
            <p className="mt-auto p-4 text-xs text-store-text/70">
              Powered by{" "}
              <Link href="/" className="font-semibold underline">
                CreatorHub BD
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
