import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getGuideBySlug, getGuides } from "@/lib/data/public";
import { formatDate } from "@/lib/utils/format";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const guides = await getGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Guide not found" };
  return {
    title: guide.title,
    description: guide.excerpt || undefined,
    openGraph: guide.cover_url ? { images: [guide.cover_url] } : undefined,
  };
}

function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      if (block.startsWith("### "))
        return (
          <h3 key={i} className="mt-4 font-sans text-lg font-bold text-brand-ink">
            {block.slice(4)}
          </h3>
        );
      if (block.startsWith("## "))
        return (
          <h2 key={i} className="mt-6 font-sans text-xl font-extrabold leading-snug text-brand-ink">
            {block.slice(3)}
          </h2>
        );
      return (
        <p key={i} className="text-gray-800">
          {block}
        </p>
      );
    });
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Link
        href="/guides"
        className="flex min-h-10 w-fit items-center gap-1 text-sm font-bold text-brand-deep"
      >
        <ChevronLeft className="h-4 w-4" /> All guides
      </Link>

      <header>
        <span className="rounded-full bg-brand-light/50 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-brand-ink">
          Guide
        </span>
        <h1 className="mt-3 text-[28px] font-extrabold leading-tight md:text-4xl">{guide.title}</h1>
        {guide.published_at && (
          <p className="mt-3 text-sm font-medium text-gray-600">
            Published {formatDate(guide.published_at)}
          </p>
        )}
      </header>

      {guide.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={guide.cover_url}
          alt={guide.title}
          className="w-full rounded-2xl border border-brand-light/60 object-cover"
        />
      )}

      <div className="flex flex-col gap-5 border-t border-brand-light/60 pt-6 font-serif text-[18px] leading-8">
        {renderContent(guide.content)}
      </div>
    </article>
  );
}
