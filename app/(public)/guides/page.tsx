import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen } from "lucide-react";
import { getGuides } from "@/lib/data/public";
import { formatDate } from "@/lib/utils/format";
import { GuidesHeader } from "@/components/public/guides-header";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Guides for Creators",
  description: "SEO guides, checklists and how-tos for Bangladeshi creators and small businesses.",
};

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="flex flex-col gap-5">
      <GuidesHeader count={guides.length} />

      {guides.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-light bg-brand-light/10 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light/50">
            <BookOpen className="h-7 w-7 text-brand-ink" />
          </span>
          <p className="font-bold">No guides published yet</p>
          <p className="max-w-xs text-sm text-gray-600">New articles are on the way.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {guides.map((g, i) => (
            <Link
              key={g.id}
              href={`/guides/${g.slug}`}
              className={`group flex flex-col overflow-hidden rounded-2xl border border-brand-light/60 bg-surface shadow-card transition-shadow hover:border-brand hover:shadow-lift ${
                i === 0 ? "md:col-span-2 md:flex-row" : ""
              }`}
            >
              <div
                className={`relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-brand-light/40 ${
                  i === 0 ? "md:aspect-auto md:w-1/2" : ""
                }`}
              >
                {g.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.cover_url}
                    alt=""
                    loading={i === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-light/60 to-brand-light/20">
                    <BookOpen className="h-10 w-10 text-brand" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4 md:p-5">
                <span className="w-fit rounded-full bg-brand-light/50 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-brand-ink">
                  Guide
                </span>
                <h2 className="mt-2 text-lg font-extrabold leading-snug">{g.title}</h2>
                {g.excerpt && (
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-gray-600">
                    {g.excerpt}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-4 text-sm">
                  <span className="font-medium text-gray-500">{formatDate(g.published_at)}</span>
                  <span className="flex items-center gap-1 font-bold text-brand-deep">
                    Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
