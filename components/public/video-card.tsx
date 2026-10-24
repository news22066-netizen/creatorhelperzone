"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { extractYouTubeId, youtubeEmbedUrl, youtubeThumbnail } from "@/lib/utils/youtube";
import { cn } from "@/lib/utils/cn";

const rankStyle: Record<number, string> = {
  1: "bg-brand text-white",
  2: "bg-brand-secondary text-brand-ink",
  3: "bg-brand-light text-brand-ink",
};

/**
 * Thumbnail first, player on tap: keeps the page light (no iframe per card)
 * while still using the privacy-friendly nocookie embed.
 */
export function VideoCard({
  youtubeUrl,
  title,
  rank,
}: {
  youtubeUrl: string | null;
  title?: string | null;
  rank?: number;
}) {
  const [playing, setPlaying] = useState(false);
  const id = extractYouTubeId(youtubeUrl);
  if (!id) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-light/60 bg-surface shadow-card">
      <div className="relative aspect-video w-full bg-brand-ink">
        {playing ? (
          <iframe
            src={`${youtubeEmbedUrl(id)}?autoplay=1&rel=0`}
            title={title ?? "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title ?? "video"}`}
            className="group absolute inset-0 block h-full w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={youtubeThumbnail(id)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-4 ring-white/70 transition-colors group-hover:bg-brand-hover">
                <Play className="ml-0.5 h-6 w-6 fill-white" />
              </span>
            </span>
          </button>
        )}
        {rank !== undefined && !playing && (
          <span
            className={cn(
              "absolute left-2 top-2 flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-extrabold shadow",
              rankStyle[rank] ?? "bg-surface text-brand-ink"
            )}
          >
            #{rank}
          </span>
        )}
      </div>
      {title ? (
        <p className="line-clamp-2 p-3 text-sm font-semibold leading-snug">{title}</p>
      ) : null}
    </div>
  );
}
