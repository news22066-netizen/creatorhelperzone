"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Flame, Hash, Lightbulb, Video, Wrench } from "lucide-react";
import { useLang } from "@/lib/i18n/language-provider";
import { extractYouTubeId } from "@/lib/utils/youtube";
import { cn } from "@/lib/utils/cn";
import { PageHeader } from "./page-header";
import { TrendingStage } from "./trending-stage";

interface Item {
  id: string;
  title: string;
  youtube_url: string | null;
}

type Filter = "all" | "videos" | "keywords" | "ideas";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function TrendingView({
  week,
  videos,
  keywords,
  thumbnails,
}: {
  week: string | null;
  videos: Item[];
  keywords: Item[];
  thumbnails: Item[];
}) {
  const { t } = useLang();
  const [filter, setFilter] = useState<Filter>("all");

  // Only videos with a playable YouTube link count (same rule the stage uses).
  const playable = videos.filter((v) => extractYouTubeId(v.youtube_url));
  const total = playable.length + keywords.length + thumbnails.length;

  const chips: { id: Filter; label: string; icon: typeof Video; count: number }[] = [
    { id: "all", label: t("trending.all"), icon: Flame, count: total },
    { id: "videos", label: t("trending.videos"), icon: Video, count: playable.length },
    { id: "keywords", label: t("trending.keywords_tab"), icon: Hash, count: keywords.length },
    { id: "ideas", label: t("trending.ideas"), icon: Lightbulb, count: thumbnails.length },
  ];

  const show = (f: Exclude<Filter, "all">) => filter === "all" || filter === f;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge={
          <>
            <Flame className="h-3.5 w-3.5 text-brand" />
            {t("trending.badge")}
          </>
        }
        title={t("trending.title")}
        subtitle={t("trending.subtitle")}
        meta={
          week ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-light/30 px-2.5 py-1 font-mono text-xs font-bold text-brand-ink">
              <CalendarDays className="h-3.5 w-3.5 text-brand" />
              {t("trending.week")} {week}
            </span>
          ) : null
        }
      />

      {total === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div
            role="group"
            aria-label="Filter trending"
            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
          >
            {chips.map(({ id, label, icon: Icon, count }) => {
              const on = filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(id)}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-all duration-150 active:scale-95",
                    on
                      ? "border-brand bg-brand text-white shadow-sm"
                      : "border-brand-light/80 bg-surface text-brand-ink hover:bg-brand-light/25"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      on ? "bg-white/25" : "bg-brand-light/40"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* key = filter so the entrance animation replays when switching */}
          <div key={filter} className="flex flex-col gap-9">
            {show("videos") && (
              <section aria-labelledby="tr-videos">
                <SectionTitle
                  id="tr-videos"
                  icon={Video}
                  title={t("trending.videos_title")}
                  sub={t("trending.play")}
                />
                {playable.length === 0 ? (
                  <Muted text={t("trending.none_videos")} />
                ) : (
                  <TrendingStage
                    videos={playable}
                    labels={{
                      prev: "Previous video",
                      next: "Next video",
                      hint: `← ${t("trending.swipe")} →`,
                      play: t("trending.play"),
                    }}
                  />
                )}
              </section>
            )}

            {show("keywords") && (
              <section aria-labelledby="tr-keywords">
                <SectionTitle
                  id="tr-keywords"
                  icon={Hash}
                  title={t("trending.keywords")}
                  sub={t("trending.keywords_sub")}
                />
                {keywords.length === 0 ? (
                  <Muted text={t("trending.none_keywords")} />
                ) : (
                  <ol className="flex flex-wrap items-center gap-2.5">
                    {keywords.map((k, i) => {
                      const hot = i < 3;
                      return (
                        <li
                          key={k.id}
                          className={cn(
                            "rise-stagger group inline-flex items-center gap-2 rounded-full font-bold transition-transform duration-150 hover:-translate-y-0.5",
                            hot
                              ? "bg-brand py-2.5 pl-3 pr-5 text-base text-white shadow-lift"
                              : "border border-brand-light/80 bg-brand-light/15 py-2 pl-2.5 pr-4 text-sm text-brand-ink"
                          )}
                          style={stagger(i)}
                        >
                          {hot ? (
                            <Flame className="h-4 w-4 text-brand-secondary" />
                          ) : (
                            <span className="font-mono text-xs tabular-nums text-gray-500">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          )}
                          <span>
                            <span className={hot ? "text-white/70" : "text-brand-deep"}>#</span>
                            {k.title}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>
            )}

            {show("ideas") && (
              <section aria-labelledby="tr-ideas">
                <SectionTitle
                  id="tr-ideas"
                  icon={Lightbulb}
                  title={t("trending.thumbnails")}
                  sub={t("trending.ideas_sub")}
                />
                {thumbnails.length === 0 ? (
                  <Muted text={t("trending.none_ideas")} />
                ) : (
                  <ol className="grid grid-cols-1 gap-x-4 gap-y-6 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                    {thumbnails.map((x, i) => (
                      <li
                        key={x.id}
                        className={cn(
                          "rise-stagger relative rounded-2xl border-2 border-dashed border-brand-light bg-brand-light/15 p-4 pt-5 transition-transform duration-200 hover:-translate-y-1 hover:rotate-0",
                          i % 2 === 0 ? "-rotate-[0.8deg]" : "rotate-[0.8deg]"
                        )}
                        style={stagger(i)}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute -top-2 left-6 h-4 w-14 -rotate-3 rounded-sm bg-brand-light/80"
                        />
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-brand-deep">
                            Idea {String(i + 1).padStart(2, "0")}
                          </span>
                          <Lightbulb className="h-4 w-4 text-brand" />
                        </div>
                        <p className="mt-2 text-[15px] font-semibold leading-snug">{x.title}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SectionTitle({
  id,
  icon: Icon,
  title,
  sub,
}: {
  id: string;
  icon: typeof Video;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light/50 text-brand-ink">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 id={id} className="text-lg font-extrabold leading-tight">
          {title}
        </h2>
        <p className="text-xs font-medium text-gray-600">{sub}</p>
      </div>
    </div>
  );
}

function Muted({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-brand-light bg-brand-light/10 p-6 text-center text-sm text-gray-600">
      {text}
    </p>
  );
}

function EmptyState() {
  const { t } = useLang();
  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-brand-light/70 bg-brand-light/10 px-6 py-14 text-center">
      <div className="relative mb-6 flex h-28 w-28 items-center justify-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border-2 border-dashed border-brand-light" />
        <span className="absolute inset-3 rounded-full bg-brand-light/40" />
        <span className="hero-drift relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-lift">
          <Flame className="h-7 w-7" />
        </span>
      </div>
      <h2 className="text-xl font-extrabold">{t("trending.empty_title")}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-700">{t("trending.empty_desc")}</p>
      <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
        <Link
          href="/tools"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-[15px] font-bold text-white shadow-sm hover:bg-brand-hover"
        >
          <Wrench className="h-4 w-4" />
          {t("trending.empty_tools")}
        </Link>
        <Link
          href="/guides"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-brand-light bg-brand-light/20 px-5 text-[15px] font-bold text-brand-ink hover:bg-brand-light/50"
        >
          <BookOpen className="h-4 w-4" />
          {t("trending.empty_guides")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
