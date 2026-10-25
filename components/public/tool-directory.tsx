"use client";

import { useMemo, useState } from "react";
import { Search, SearchX, Sparkles, X } from "lucide-react";
import type { Tool } from "@/types/database";
import { ToolCard } from "./tool-card";
import { cn } from "@/lib/utils/cn";
import { useLang } from "@/lib/i18n/language-provider";
import { PageHeader } from "./page-header";

type Tab = "all" | "popular" | "new";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "popular", label: "Popular" },
  { id: "new", label: "New" },
];

const POPULAR_COUNT = 8;
const NEW_COUNT = 12;

/**
 * Tool directory: hero, search, tabs, result count, cards.
 * `tools` arrives sorted by the admin's sort_order, so "Popular" = the admin's
 * top picks and "New" = most recently added. Filtering is client-side.
 */
export function ToolDirectory({ tools }: { tools: Tool[] }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const visible = useMemo(() => {
    let list = tools;
    if (tab === "popular") list = tools.slice(0, POPULAR_COUNT);
    if (tab === "new")
      list = [...tools]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, NEW_COUNT);

    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((t) => `${t.name} ${t.description}`.toLowerCase().includes(q));
  }, [tools, tab, query]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        badge={
          <>
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            {tools.length}+ {t("tools.badge")}
          </>
        }
        title={t("tools.title")}
        subtitle={t("tools.subtitle")}
      />

      {/* Plain search bar */}
      <label className="flex h-12 items-center gap-3 rounded-2xl border border-brand-light/70 bg-surface px-4 shadow-card focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
        <Search className="h-5 w-5 shrink-0 text-brand" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("tools.search")}
          aria-label="Search tools"
          className="h-full w-full bg-transparent text-[15px] text-brand-ink placeholder:text-gray-500 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-brand-light/40"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </label>

      <div
        role="tablist"
        aria-label="Filter tools"
        className="grid grid-cols-3 gap-1 rounded-2xl border border-brand-light/70 bg-brand-light/15 p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "h-11 rounded-xl text-sm font-bold transition-colors",
              tab === t.id
                ? "bg-brand text-white shadow-sm"
                : "text-gray-700 hover:bg-brand-light/40"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-600" aria-live="polite">
        Showing <strong className="text-brand-ink">{visible.length}</strong>{" "}
        {visible.length === 1 ? "tool" : "tools"}
        {query.trim() && (
          <>
            {" "}
            for <strong className="text-brand-ink">“{query.trim()}”</strong>
          </>
        )}
      </p>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-light bg-brand-light/10 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light/50">
            <SearchX className="h-7 w-7 text-brand-ink" />
          </span>
          <p className="font-bold">
            {tools.length === 0 ? "No tools listed yet" : "No tools match your search"}
          </p>
          <p className="max-w-xs text-sm text-gray-600">
            {tools.length === 0
              ? "New tools are added regularly."
              : "Try a different word, or browse all tools."}
          </p>
          {tools.length > 0 && (
            <button
              onClick={() => {
                setQuery("");
                setTab("all");
              }}
              className="h-11 rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover"
            >
              Show all tools
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
