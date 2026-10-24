"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Phone, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { href: "", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/contact", label: "Contact", icon: Phone },
] as const;

/** Fixed bottom nav: Home | Shop | Contact. */
export function StoreBottomNav({ username }: { username: string }) {
  const pathname = usePathname();
  const base = `/${username}`;

  return (
    <nav
      aria-label="Store"
      className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-store-text/10 bg-store-bg/95 backdrop-blur"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 md:max-w-3xl">
        {TABS.map(({ href, label, icon: Icon }) => {
          const full = `${base}${href}`;
          const active = href === "" ? pathname === base : pathname === full || pathname.startsWith(`${full}/`);
          return (
            <Link
              key={label}
              href={full}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-16 min-w-[44px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                active ? "text-store-primary" : "text-store-text/70 hover:text-store-text"
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
