import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProsePage } from "@/components/public/prose-page";
import { blogPosts } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Blog",
  description: "News, tips and stories from CreatorHub BD for Bangladeshi creators.",
};

export default function BlogIndexPage() {
  return (
    <ProsePage title="Blog" intro="News, tips and stories for Bangladeshi creators. More posts coming soon.">
      <ul className="!list-none !space-y-3 !pl-0">
        {blogPosts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="group block rounded-2xl border border-brand-light/60 bg-surface p-4 !no-underline shadow-card transition-shadow hover:border-brand hover:shadow-lift"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <time dateTime={p.date}>{formatDate(p.date)}</time>
                <span>·</span>
                <span>{p.readingMinutes} min read</span>
                {p.sample && (
                  <span className="rounded-full bg-brand-light/50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-ink">
                    Sample
                  </span>
                )}
              </div>
              <h2 className="!mt-1 text-lg !font-extrabold !text-brand-ink">{p.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{p.excerpt}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-brand-deep">
                Read <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </ProsePage>
  );
}
