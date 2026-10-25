"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, DollarSign, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ToolsPromo } from "@/components/shared/tools-promo";

const TABS = [
  { href: "", label: "Home", icon: Home },
  { href: "/works", label: "Works", icon: Briefcase },
  { href: "/pricing", label: "Pricing", icon: DollarSign },
] as const;

/** Fixed bottom bar: animated "free tools" strip + Home | Works | Pricing. Uses the page's own colors. */
export function PublicNav({ username }: { username: string }) {
  const pathname = usePathname() ?? "";
  const base = `/${username}`;
  return (
    <div className="cp-page cp-bar pb-safe fixed inset-x-0 bottom-0 z-30 border-t">
      <ToolsPromo />
      <nav aria-label="Page" className="mx-auto grid max-w-md grid-cols-3 md:max-w-3xl">
        {TABS.map(({ href, label, icon: Icon }) => {
          const full = `${base}${href}`;
          const active = href === "" ? pathname === base : pathname === full || pathname.startsWith(`${full}/`);
          return (
            <Link key={label} href={full} aria-current={active ? "page" : undefined}
              className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-opacity", active ? "opacity-100" : "opacity-75 hover:opacity-100")}>
              <span className={cn("flex h-7 w-12 items-center justify-center rounded-full", active && "bg-[rgb(var(--cp-text-rgb)/0.16)]")}>
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.6 : 2} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
