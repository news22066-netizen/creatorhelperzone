"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Flame, Handshake, ShoppingBag, Wrench } from "lucide-react";
import { useLang } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils/cn";

const sections = [
  { href: "/tools", icon: Wrench, titleKey: "home.section_tools", descKey: "home.section_tools_desc", featured: true },
  { href: "/trending", icon: Flame, titleKey: "home.section_trending", descKey: "home.section_trending_desc" },
  { href: "/guides", icon: BookOpen, titleKey: "home.section_guides", descKey: "home.section_guides_desc" },
  { href: "/store", icon: ShoppingBag, titleKey: "home.section_store", descKey: "home.section_store_desc" },
  { href: "/collaboration", icon: Handshake, titleKey: "home.section_collab", descKey: "home.section_collab_desc", soon: true },
];

export function SectionGrid() {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {sections.map(({ href, icon: Icon, titleKey, descKey, featured, soon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "group relative flex flex-col rounded-2xl border border-brand-light/60 bg-surface p-4 shadow-card transition-shadow hover:border-brand hover:shadow-lift",
            featured && "col-span-2 bg-brand-light/20 md:col-span-1"
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light/60 text-brand-ink">
              <Icon className="h-5 w-5" />
            </span>
            {soon ? (
              <span className="rounded-full bg-brand-light/50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-ink">
                Soon
              </span>
            ) : (
              <ArrowUpRight className="h-5 w-5 text-brand transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            )}
          </div>
          <h3 className="font-bold text-brand-ink">{t(titleKey)}</h3>
          <p className="mt-1 text-xs leading-snug text-gray-600">{t(descKey)}</p>
        </Link>
      ))}
    </div>
  );
}
