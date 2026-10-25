import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check, Clock } from "lucide-react";

export function ComingSoon({
  title,
  description,
  icon,
  features = [],
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  features?: string[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <section className="relative overflow-hidden rounded-3xl border border-brand-light bg-gradient-to-br from-brand-light/40 via-surface to-surface px-6 py-12 text-center md:py-16">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-light/40" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-brand-secondary/15" />
        <div className="relative flex flex-col items-center gap-3">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand text-white shadow-lift">
            {icon ?? <Clock className="h-9 w-9" />}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-brand-ink">
            <Clock className="h-3.5 w-3.5" /> Coming soon
          </span>
          <h1 className="text-2xl font-extrabold md:text-3xl">{title}</h1>
          <p className="max-w-sm text-[15px] leading-relaxed text-gray-700">{description}</p>

          {features.length > 0 && (
            <ul className="mt-2 flex w-full max-w-sm flex-col gap-2 text-left">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 rounded-xl border border-brand-light/70 bg-surface px-3 py-2.5 text-sm font-medium"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light/70">
                    <Check className="h-3.5 w-3.5 text-brand-ink" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/tools"
            className="mt-3 inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-bold text-white shadow-sm hover:bg-brand-hover"
          >
            Explore free tools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
