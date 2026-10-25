"use client";

import Link from "next/link";
import { ArrowRight, Check, Info } from "lucide-react";
import { useLang } from "@/lib/i18n/language-provider";
import { pricingCopy } from "@/lib/i18n/pricing-copy";
import { ctaPrimary, ctaSecondary, SectionHead } from "./home/home-ui";

/** Public /pricing body. Bilingual like the home page (language toggle in the header). */
export function PricingView() {
  const { lang } = useLang();
  const c = pricingCopy[lang];

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <section className="rounded-3xl border border-brand-light/60 bg-gradient-to-b from-brand-light/30 via-surface to-surface px-5 py-10 text-center shadow-card md:py-14">
        <span className="hero-rise inline-flex items-center rounded-full border border-brand-light bg-surface px-3 py-1 text-xs font-bold text-brand-ink">
          {c.kicker}
        </span>
        <h1
          className="hero-rise mt-4 text-[34px] font-extrabold leading-[1.25] tracking-tight md:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          {c.title}
        </h1>
        <p
          className="hero-rise mx-auto mt-3 max-w-xl text-[15px] font-medium leading-relaxed text-gray-700 md:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          {c.sub}
        </p>
        <div
          className="hero-rise mx-auto mt-6 flex w-fit items-baseline gap-2 rounded-2xl border-2 border-brand bg-surface px-6 py-3"
          style={{ animationDelay: "240ms" }}
        >
          <span className="text-5xl font-extrabold leading-none text-brand md:text-6xl">{c.priceLabel}</span>
          <span className="max-w-[12rem] text-left text-xs font-semibold leading-snug text-gray-600">{c.priceNote}</span>
        </div>
        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link href="/signup?role=creator" className={ctaPrimary}>
            {c.ctaCreator}
            <ArrowRight className="cta-arrow h-4 w-4" />
          </Link>
          <Link href="/signup?role=business" className={ctaSecondary}>
            {c.ctaBusiness}
            <ArrowRight className="cta-arrow h-4 w-4" />
          </Link>
        </div>
      </section>

      <section>
        <SectionHead kicker={c.includedKicker} title={c.includedTitle} />
        <div className="grid gap-3 md:grid-cols-3">
          {c.groups.map((g) => (
            <div
              key={g.title}
              className="reveal lift-card rounded-2xl border border-brand-light/60 bg-surface p-4 shadow-card"
            >
              <h3 className="text-lg font-extrabold">{g.title}</h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {g.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-800">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHead kicker={c.promiseKicker} title={c.promiseTitle} />
        <ul className="grid gap-3 md:grid-cols-3">
          {c.promises.map((p) => (
            <li
              key={p.title}
              className="reveal rounded-2xl border border-brand-light/60 bg-brand-light/15 p-4"
            >
              <h3 className="font-extrabold">{p.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">{p.desc}</p>
            </li>
          ))}
        </ul>
        <div
          role="note"
          className="reveal mt-3 flex gap-3 rounded-2xl border border-brand-light bg-surface p-4"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div>
            <p className="font-extrabold">{c.laterTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{c.laterBody}</p>
          </div>
        </div>
      </section>

      <section>
        <SectionHead kicker={c.faqKicker} title={c.faqTitle} />
        <div className="flex flex-col gap-2.5">
          {c.faq.map((it) => (
            <details
              key={it.q}
              className="group overflow-hidden rounded-2xl border border-brand-light/70 bg-surface shadow-card open:border-brand"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[15px] font-bold leading-snug marker:content-none [&::-webkit-details-marker]:hidden">
                {it.q}
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light/50 text-lg font-bold leading-none text-brand-ink transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>
              <p className="bg-brand-light/15 px-4 py-3 text-[15px] leading-relaxed text-gray-800">{it.a}</p>
            </details>
          ))}
        </div>
        <Link
          href="/tools"
          className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-brand-deep hover:underline"
        >
          {c.ctaTools} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
