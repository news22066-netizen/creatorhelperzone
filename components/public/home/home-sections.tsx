"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Flame,
  Gift,
  Link2,
  MessageCircle,
  Timer,
  Briefcase,
  Sparkles,
  Store,
  Wrench,
} from "lucide-react";
import { ToolIcon } from "@/components/public/tool-icon";
import { formatCount, useHomeCopy } from "./use-home-copy";
import { ctaPrimary, ctaSecondary, SectionHead } from "./home-ui";

export type HomeTool = {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string | null;
};

/* 2) Trust strip */
export function TrustStrip({ toolCount }: { toolCount: number }) {
  const { c, lang } = useHomeCopy();
  const icons = [Gift, MessageCircle, Timer, Wrench];
  const items = [
    ...c.trust.items,
    {
      title:
        toolCount > 0
          ? c.trust.toolsTitle.replace("{n}", formatCount(toolCount, lang))
          : c.trust.toolsTitleFallback,
      desc: c.trust.toolsDesc,
    },
  ];
  return (
    <section aria-label="BFEED">
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((it, i) => {
          const Icon = icons[i];
          return (
            <li
              key={it.title}
              className="rounded-2xl border border-brand-light/60 bg-brand-light/15 p-3.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <p className="mt-2 text-[15px] font-extrabold leading-snug">{it.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{it.desc}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* 3) How it works */
export function HowItWorks() {
  const { c } = useHomeCopy();
  return (
    <section>
      <SectionHead kicker={c.how.kicker} title={c.how.title} />
      <ol className="grid gap-3 md:grid-cols-3">
        {c.how.steps.map((s, i) => (
          <li
            key={s.title}
            className="reveal relative rounded-2xl border border-brand-light/60 bg-surface p-4 shadow-card"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white">
              {i + 1}
            </span>
            <h3 className="mt-3 text-lg font-extrabold leading-snug">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* 4) Features */
export function FeaturesGrid() {
  const { c } = useHomeCopy();
  const icons = [Link2, Store, MessageCircle, Briefcase, Wrench, Flame];
  return (
    <section>
      <SectionHead kicker={c.features.kicker} title={c.features.title} />
      <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {c.features.items.map((f, i) => {
          const Icon = icons[i];
          return (
            <li
              key={f.title}
              className="reveal lift-card flex gap-3 rounded-2xl border border-brand-light/60 bg-surface p-4 shadow-card sm:flex-col"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light/50 text-brand-ink">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-extrabold leading-snug">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">{f.desc}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* 5) Popular tools (data comes from the existing getTools() call on the server page) */
export function PopularTools({ tools }: { tools: HomeTool[] }) {
  const { c } = useHomeCopy();
  return (
    <section>
      <SectionHead
        kicker={c.tools.kicker}
        title={c.tools.title}
        action={
          <Link
            href="/tools"
            className="hidden min-h-11 items-center gap-1 text-sm font-bold text-brand-deep hover:underline sm:flex"
          >
            {c.tools.seeAll} <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      {tools.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-light bg-brand-light/10 p-6 text-center text-sm text-gray-600">
          {c.tools.empty}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.slug ? `/tools/${tool.slug}` : "/tools"}
              className="flex items-center gap-3 rounded-2xl border border-brand-light/60 bg-surface p-3 shadow-card transition-shadow hover:border-brand hover:shadow-lift"
            >
              <ToolIcon icon={tool.icon} className="h-11 w-11 rounded-xl" imgClassName="h-6 w-6" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{tool.name}</span>
                <span className="line-clamp-1 text-xs text-gray-600">{tool.description}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
      <Link
        href="/tools"
        className="mt-3 flex min-h-11 items-center justify-center gap-1 text-sm font-bold text-brand-deep hover:underline sm:hidden"
      >
        {c.tools.seeAll} <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

/* 6) Creators vs Business (both are live: real features, real CTAs) */
export function AudienceSplit() {
  const { c } = useHomeCopy();
  const a = c.audience;
  const freeLine = (
    <p className="mt-3 text-center text-xs font-semibold text-gray-600">
      {a.freeNote}{" "}
      <Link href="/pricing" className="text-brand-deep underline-offset-2 hover:underline">
        {a.pricingLink}
      </Link>
    </p>
  );
  return (
    <section>
      <SectionHead kicker={a.kicker} title={a.title} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="reveal lift-card flex flex-col rounded-3xl border border-brand-light bg-brand-light/20 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <h3 className="mt-3 text-xl font-extrabold">{a.creator.name}</h3>
          <p className="text-xs font-semibold text-gray-600">{a.creator.tag}</p>
          <ul className="mt-3 flex flex-1 flex-col gap-2.5">
            {a.creator.points.map((p) => (
              <li key={p} className="flex gap-2 text-sm leading-relaxed text-gray-800">
                <Check className="mt-1 h-4 w-4 shrink-0 text-brand" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/signup?role=creator" className={`${ctaPrimary} mt-5`}>
            {a.creator.cta}
            <ArrowRight className="cta-arrow h-4 w-4" />
          </Link>
          {freeLine}
        </div>

        <div className="reveal lift-card flex flex-col rounded-3xl border border-brand-light/70 bg-surface p-5 shadow-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light/50 text-brand-ink">
            <Briefcase className="h-5 w-5" />
          </span>
          <h3 className="mt-3 text-xl font-extrabold">{a.business.name}</h3>
          <p className="text-xs font-semibold text-gray-600">{a.business.tag}</p>
          <ul className="mt-3 flex flex-1 flex-col gap-2.5">
            {a.business.points.map((p) => (
              <li key={p} className="flex gap-2 text-sm leading-relaxed text-gray-800">
                <Check className="mt-1 h-4 w-4 shrink-0 text-brand" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/signup?role=business" className={`${ctaSecondary} mt-5`}>
            {a.business.cta}
            <ArrowRight className="cta-arrow h-4 w-4" />
          </Link>
          {freeLine}
        </div>
      </div>
    </section>
  );
}

/* 7) FAQ (native <details>: no JS state, keyboard accessible) */
export function HomeFaq() {
  const { c } = useHomeCopy();
  return (
    <section>
      <SectionHead kicker={c.faq.kicker} title={c.faq.title} />
      <div className="flex flex-col gap-2.5">
        {c.faq.items.map((it, i) => (
          <details
            key={it.q}
            open={i === 0}
            className="group overflow-hidden rounded-2xl border border-brand-light/70 bg-surface shadow-card open:border-brand"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[15px] font-bold leading-snug marker:content-none [&::-webkit-details-marker]:hidden">
              {it.q}
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light/50 text-lg font-bold leading-none text-brand-ink transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="bg-brand-light/15 px-4 py-3 text-[15px] leading-relaxed text-gray-800">{it.a}</p>
          </details>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5">
        <Link
          href="/faq"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-brand-deep hover:underline"
        >
          {c.faq.more} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/pricing"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-brand-deep hover:underline"
        >
          {c.faqPricingLink} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* 8) Final CTA: a "claim your URL" panel instead of decorative blobs */
export function FinalCta() {
  const { c } = useHomeCopy();
  return (
    <section className="reveal relative overflow-hidden rounded-3xl bg-brand-forest px-5 py-10 text-center text-white md:px-10 md:py-14">
      {/* faint grid texture, no blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:28px_28px]"
      />
      <div className="relative mx-auto max-w-xl">
        <h2 className="text-[26px] font-extrabold leading-snug tracking-tight md:text-4xl">{c.final.title}</h2>
        <p className="mt-3 text-[15px] font-medium leading-relaxed text-white/85 md:text-lg">{c.final.sub}</p>

        {/* the URL they are about to own */}
        <Link
          href="/signup"
          aria-label="bfeed.store/yourname"
          className="mx-auto mt-6 flex w-fit max-w-full items-center rounded-full border border-white/25 bg-white/10 px-4 py-2.5 font-mono text-sm font-semibold transition-colors hover:bg-white/15 md:text-base"
        >
          <span className="text-white/70">bfeed.store/</span>
          <span className="text-[#84fa9a]">yourname</span>
          <span aria-hidden="true" className="claim-caret ml-0.5 inline-block h-[1.1em] w-[2px] bg-[#42e55f]" />
        </Link>

        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link
            href="/signup?role=creator"
            className="inline-flex h-12 min-w-[44px] items-center justify-center gap-2 rounded-xl bg-[#84fa9a] px-6 text-[15px] font-bold text-[#0f1f14] shadow-sm transition duration-150 hover:-translate-y-0.5 hover:bg-[#42e55f] hover:shadow-lift active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {c.final.ctaCreator}
            <ArrowRight className="cta-arrow h-4 w-4" />
          </Link>
          <Link
            href="/signup?role=business"
            className="inline-flex h-12 min-w-[44px] items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-6 text-[15px] font-bold text-white transition duration-150 hover:-translate-y-0.5 hover:border-white hover:bg-white/10 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {c.final.ctaBusiness}
            <ArrowRight className="cta-arrow h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[13px] font-semibold text-white/85">
          {c.final.perks.map((p) => (
            <li key={p} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[#42e55f]" />
              {p}
            </li>
          ))}
        </ul>
        <Link
          href="/pricing"
          className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-[#84fa9a] underline-offset-4 hover:underline"
        >
          {c.final.pricingLink} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
