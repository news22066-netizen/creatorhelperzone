import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronDown, ChevronLeft, ExternalLink } from "lucide-react";
import { getToolBySlug, getTools } from "@/lib/data/public";
import { SITE_URL } from "@/lib/constants";
import { parseToolContent, renderBlocks } from "@/lib/utils/markdown";
import { ToolIcon } from "@/components/public/tool-icon";
import { ToolCard } from "@/components/public/tool-card";

// ISR: static HTML, refreshed at most every 5 min and instantly when an admin saves.
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

// Pre-render known tools at build; new slugs render on first request (dynamicParams default).
export async function generateStaticParams() {
  const tools = await getTools();
  return tools.filter((t) => t.slug).map((t) => ({ slug: t.slug as string }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return { title: "Tool not found", robots: { index: false } };

  const title = tool.meta_title?.trim() || tool.name;
  const description = tool.meta_description?.trim() || tool.description || undefined;
  const canonical = `${SITE_URL}/tools/${tool.slug}`;

  return {
    // meta_title is written by the admin as the full title, so skip the "| Site" template.
    title: tool.meta_title?.trim() ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title, description },
  };
}

// Escape "<" so admin text can never close the <script> tag.
function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function ToolDetailPage({ params }: Params) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  const { body, faqs } = parseToolContent(tool.content ?? "");

  const structured = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  const related = (await getTools())
    .filter((t) => t.id !== tool.id && t.slug)
    .slice(0, 3);

  return (
    <article className="flex flex-col gap-4">
      <Link
        href="/tools"
        className="flex min-h-10 w-fit items-center gap-1 text-sm font-bold text-brand-deep"
      >
        <ChevronLeft className="h-4 w-4" /> All tools
      </Link>

      <header className="rounded-3xl border border-brand-light/70 bg-gradient-to-br from-brand-light/30 to-surface p-5 shadow-card md:p-8">
        <div className="flex items-start gap-4">
          <ToolIcon icon={tool.icon} className="h-16 w-16 rounded-2xl text-3xl" imgClassName="h-9 w-9" />
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-brand-light/60 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-brand-ink">
              Free tool
            </span>
            <h1 className="mt-1.5 text-2xl font-extrabold leading-tight md:text-3xl">{tool.name}</h1>
          </div>
        </div>
        {tool.description && (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-700 md:text-base">
            {tool.description}
          </p>
        )}
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-bold text-white shadow-sm hover:bg-brand-hover sm:w-auto"
        >
          <ExternalLink className="h-4 w-4" />
          Visit {tool.name}
        </a>
      </header>

      {body.length > 0 && (
        <section className="flex flex-col gap-4 rounded-3xl border border-brand-light/60 bg-surface p-5 font-serif text-[17px] leading-8 shadow-card md:p-8">
          {renderBlocks(body)}
        </section>
      )}

      {faqs.length > 0 && (
        <section className="rounded-3xl border border-brand-light/60 bg-surface p-5 shadow-card md:p-8">
          <h2 className="mb-2 text-lg font-extrabold">FAQ</h2>
          <div className="flex flex-col divide-y divide-brand-light/60">
            {faqs.map((f, i) => (
              <details key={i} className="group" open={i === 0}>
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-brand transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-gray-700">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-extrabold">More free tools</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {related.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}

      {structured && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(structured) }}
        />
      )}
    </article>
  );
}
