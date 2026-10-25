import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Tool } from "@/types/database";
import { ToolIcon } from "./tool-icon";

/**
 * Directory list card: icon + name + description, then
 * "View Details" (internal SEO page) and "Visit" (external site).
 * The two links are siblings — never nested.
 */
export function ToolCard({
  tool,
  openLabel = "Visit",
  viewLabel = "View Details",
}: {
  tool: Tool;
  openLabel?: string;
  viewLabel?: string;
}) {
  const href = tool.slug ? `/tools/${tool.slug}` : null;
  const head = (
    <div className="flex items-start gap-3">
      <ToolIcon icon={tool.icon} className="h-12 w-12 rounded-2xl" />
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-bold leading-tight text-brand-ink">{tool.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-gray-600">
          {tool.description || "Free tool for creators."}
        </p>
      </div>
    </div>
  );

  return (
    <article className="flex flex-col justify-between gap-4 rounded-2xl border border-brand-light/60 bg-surface p-4 shadow-card transition-shadow hover:shadow-lift">
      {href ? (
        <Link href={href} className="block rounded-lg">
          {head}
        </Link>
      ) : (
        head
      )}
      <div className="grid grid-cols-2 gap-2">
        {href ? (
          <Link
            href={href}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-brand-light bg-surface text-sm font-bold text-brand-ink hover:border-brand hover:bg-brand-light/20"
          >
            {viewLabel}
          </Link>
        ) : (
          <span />
        )}
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-brand text-sm font-bold text-white shadow-sm hover:bg-brand-hover"
        >
          {openLabel}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}
