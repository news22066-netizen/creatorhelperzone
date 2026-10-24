"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Flame, Link2, Sparkles, Wrench } from "lucide-react";
import { useLang } from "@/lib/i18n/language-provider";

/**
 * Home hero. Animation is pure CSS (see globals.css: hero-rise / hero-drift),
 * so there is no JS animation library and prefers-reduced-motion switches it off.
 * "use client" is only needed for the i18n hook.
 */

// Hero CTAs. Primary: solid #2f9a42 + white text. Secondary: soft #84fa9a outline.
const ctaBase =
  "inline-flex h-12 min-w-[44px] items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-bold transition-colors transition-transform duration-150 active:scale-[0.98]";
const ctaPrimary = `${ctaBase} bg-brand text-white shadow-sm hover:bg-brand-deep`;
const ctaSecondary = `${ctaBase} border-2 border-brand-light bg-brand-light/20 text-brand-ink hover:bg-brand-light/50`;

/** Light repeated marks (plus + dot) in brand greens. Inline, no external image. */
function PatternLayer() {
  return (
    <svg
      aria-hidden="true"
      className="hero-drift-slow pointer-events-none absolute -inset-4 h-[calc(100%+2rem)] w-[calc(100%+2rem)] opacity-70 [mask-image:radial-gradient(ellipse_at_70%_20%,black_10%,transparent_75%)]"
    >
      <defs>
        <pattern id="hero-marks" width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M6 3v6M3 6h6" stroke="#84fa9a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="30" cy="28" r="2" fill="#42e55f" fillOpacity="0.55" />
          <rect x="22" y="6" width="5" height="5" rx="1.5" fill="#2f9a42" fillOpacity="0.18" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-marks)" />
    </svg>
  );
}

/** Little product preview: a creator page card with link rows. */
function PreviewCard() {
  const rows = ["My YouTube channel", "Free class on Facebook", "Shop my products"];
  return (
    <div className="hero-pop relative mx-auto w-full max-w-[260px]" style={{ animationDelay: "350ms" }}>
      <div className="hero-drift rounded-3xl border border-brand-light/70 bg-white p-4 shadow-lift">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-base font-extrabold text-white">
            R
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold">Rafi Ahmed</span>
            <span className="block truncate text-xs font-semibold text-brand-deep">bfeed.store/rafi</span>
          </span>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {rows.map((r) => (
            <li
              key={r}
              className="flex items-center gap-2 rounded-xl border border-brand-light/70 bg-brand-light/15 px-3 py-2 text-xs font-bold"
            >
              <Link2 className="h-3.5 w-3.5 shrink-0 text-brand" />
              <span className="truncate">{r}</span>
            </li>
          ))}
        </ul>
      </div>
      <span
        className="hero-drift-slow absolute -right-2 -top-3 flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-extrabold text-white shadow-sm"
        aria-hidden="true"
      >
        <Sparkles className="h-3 w-3" /> Hello creator!
      </span>
    </div>
  );
}

export function HeroSection({ toolCount }: { toolCount: number }) {
  const { t } = useLang();

  const stats = [
    { icon: Wrench, value: `${toolCount}+`, label: "Free tools" },
    { icon: BookOpen, value: "SEO", label: "Guides" },
    { icon: Flame, value: "Weekly", label: "Trending" },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-light/60 bg-gradient-to-b from-brand-light/25 via-white to-white p-6 shadow-card md:p-10">
      <PatternLayer />
      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-light/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-brand-secondary/15 blur-2xl" />

      <div className="relative grid items-center gap-8 md:grid-cols-[1.25fr_1fr]">
        <div>
          <span
            className="hero-rise inline-flex items-center gap-1.5 rounded-full border border-brand-light bg-white/80 px-3 py-1 text-xs font-bold text-brand-ink"
            style={{ animationDelay: "0ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {t("home.badge")}
          </span>

          <h1
            className="hero-rise mt-4 text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-5xl"
            style={{ animationDelay: "80ms" }}
          >
            {t("home.hero_title_pre")}
            <span className="rounded-lg bg-brand-light/70 px-1.5 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
              {t("home.hero_title_hl")}
            </span>
            {t("home.hero_title_post")}
          </h1>

          <p
            className="hero-rise mt-3 max-w-xl text-[15px] font-medium leading-relaxed text-gray-700 md:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            {t("home.hero_subtitle")}
          </p>

          <div
            className="hero-rise mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "240ms" }}
          >
            <Link href="/signup" className={ctaPrimary}>
              {t("home.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tools" className={ctaSecondary}>
              {t("home.cta_secondary")}
            </Link>
          </div>
          <p
            className="hero-rise mt-2 text-xs font-medium text-gray-600"
            style={{ animationDelay: "300ms" }}
          >
            {t("home.cta_free_note")}
          </p>

          <dl
            className="hero-rise mt-6 grid max-w-md grid-cols-3 gap-2 text-center"
            style={{ animationDelay: "360ms" }}
          >
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-2xl border border-brand-light/70 bg-white/80 px-2 py-3">
                <Icon className="mx-auto mb-1 h-4 w-4 text-brand" />
                <dt className="sr-only">{label}</dt>
                <dd className="text-base font-extrabold leading-none">{value}</dd>
                <p className="mt-1 text-[11px] font-semibold text-gray-600">{label}</p>
              </div>
            ))}
          </dl>
        </div>

        <PreviewCard />
      </div>
    </section>
  );
}
