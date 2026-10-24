"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/dashboard/business", label: "Home", exact: true },
  { href: "/dashboard/business/products", label: "Products" },
  { href: "/dashboard/business/profile", label: "Profile & Contact" },
  { href: "/dashboard/business/settings", label: "Settings" },
  { href: "/dashboard/business/privacy", label: "Privacy Policy" },
  { href: "/dashboard/business/guide", label: "Business Guide" },
] as const;

export function BusinessNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Store dashboard" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {NAV.map((item) => {
        const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-bold transition-colors",
              active
                ? "border-brand bg-brand text-white"
                : "border-brand-light/80 bg-white text-brand-ink hover:bg-brand-light/25"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
