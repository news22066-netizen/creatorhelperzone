"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { extractYouTubeId, youtubeEmbedUrl, youtubeThumbnail } from "@/lib/utils/youtube";

/** YouTube only. Thumbnail first; the player loads after a tap (no iframe, no autoplay on page load). */
export function YoutubeLite({ url, title, small = false }: { url: string; title: string; small?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const id = extractYouTubeId(url);
  if (!id) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      {playing ? (
        <iframe
          src={`${youtubeEmbedUrl(id)}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`} className="group absolute inset-0 block h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={youtubeThumbnail(id)} alt="" loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute inset-0 bg-black/25" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className={`flex items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110 ${small ? "h-9 w-9" : "h-14 w-14"}`}>
              <Play className={`ml-0.5 fill-current ${small ? "h-4 w-4" : "h-6 w-6"}`} />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
