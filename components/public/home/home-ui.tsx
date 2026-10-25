import type { ReactNode } from "react";

// CTA styles shared by every home section. Primary: solid #2f9a42 + white. Secondary: soft #84fa9a outline.
const base =
  "inline-flex h-12 min-w-[44px] items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-bold transition duration-150 hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0";
export const ctaPrimary = `${base} bg-brand text-white shadow-sm hover:bg-brand-hover`;
export const ctaSecondary = `${base} border-2 border-brand-light bg-brand-light/20 text-brand-ink hover:bg-brand-light/50`;

export function SectionHead({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <span className="inline-block rounded-full bg-brand-light/50 px-3 py-1 text-xs font-bold text-brand-ink">
          {kicker}
        </span>
        <h2 className="mt-2 text-2xl font-extrabold leading-snug tracking-tight md:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
