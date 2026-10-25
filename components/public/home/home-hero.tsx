"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHomeCopy } from "./use-home-copy";
import { ctaPrimary, ctaSecondary } from "./home-ui";
import { ToolMarquee, type MarqueeTool } from "./tool-marquee";

export function HomeHero({ marqueeTools }: { marqueeTools: MarqueeTool[] }) {
  const { c } = useHomeCopy();
  const h = c.hero;

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate overflow-hidden rounded-3xl border border-brand-light/60 bg-gradient-to-b from-brand-light/30 via-surface to-surface shadow-card"
    >
      <ToolMarquee tools={marqueeTools} />
      {/* white wash so the text always stays readable over the moving icons */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_50%,rgb(var(--surface))_32%,rgb(var(--surface)/0.9)_58%,rgb(var(--surface)/0)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-2xl flex-col items-center justify-center px-5 py-14 text-center md:min-h-[580px]">
        <span className="hero-rise inline-flex items-center gap-1.5 rounded-full border border-brand-light bg-surface px-3 py-1 text-xs font-bold text-brand-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          {h.kicker}
        </span>

        <h1
          id="home-hero-title"
          className="hero-rise mt-5 text-[30px] font-extrabold leading-[1.35] tracking-tight md:text-5xl md:leading-[1.3]"
          style={{ animationDelay: "80ms" }}
        >
          {h.pre}
          <span className="rounded-lg bg-brand-light/70 px-1.5 [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
            {h.hl}
          </span>
          {h.post}
        </h1>

        <p
          className="hero-rise mt-4 max-w-xl text-[15px] font-medium leading-relaxed text-gray-700 md:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          {h.sub}
        </p>

        <div
          className="hero-rise mt-7 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <Link href="/signup" className={ctaPrimary}>
            {h.ctaPrimary}
            <ArrowRight className="cta-arrow h-4 w-4" />
          </Link>
          <Link href="/tools" className={ctaSecondary}>
            {h.ctaSecondary}
          </Link>
        </div>

        <p
          className="hero-rise mt-4 rounded-full border border-brand-light/70 bg-surface px-3 py-1 font-mono text-xs font-semibold text-brand-deep"
          style={{ animationDelay: "320ms" }}
        >
          {h.urlLabel}
        </p>
      </div>
    </section>
  );
}
