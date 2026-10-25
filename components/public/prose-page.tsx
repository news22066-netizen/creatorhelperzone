import type { ReactNode } from "react";
import { FooterLinks } from "./footer-links";

export function ProsePage({
  title,
  intro,
  updated,
  template,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  /** Shows a "template, to be refined" notice (legal pages). */
  template?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <article className="mx-auto w-full max-w-2xl">
        <header className="mb-6 border-b border-brand-light/60 pb-5">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
          {intro && <p className="mt-2 text-[15px] leading-relaxed text-gray-700 md:text-lg">{intro}</p>}
          {updated && <p className="mt-2 text-xs font-semibold text-gray-500">Last updated: {updated}</p>}
        </header>

        {template && (
          <p
            role="note"
            className="mb-6 rounded-xl border border-brand-light bg-brand-light/20 px-4 py-3 text-sm font-medium text-brand-ink"
          >
            Template: this page is a starting draft and will be refined (and reviewed by a legal
            professional) before it is final.
          </p>
        )}

        <div
          className="space-y-4 text-[15px] leading-7 text-gray-800
            [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-brand-ink
            [&_h3]:mt-5 [&_h3]:font-bold [&_h3]:text-brand-ink
            [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5
            [&_a]:font-semibold [&_a]:text-brand-deep [&_a]:underline"
        >
          {children}
        </div>
      </article>
      <FooterLinks />
    </div>
  );
}
