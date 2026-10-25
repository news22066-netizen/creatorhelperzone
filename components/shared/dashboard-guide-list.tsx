import Link from "next/link";
import { BookOpen } from "lucide-react";
import { YoutubeLite } from "@/components/creator/youtube-lite";
import type { DashboardGuide } from "@/types/database";

/** Lessons curated in /admin/dashboard-guides. Thumbnail first; the player loads only after a tap. */
export function DashboardGuideList({ guides, intro }: { guides: DashboardGuide[]; intro: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-700">{intro}</p>

      {guides.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-light bg-brand-light/10 px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light/50">
            <BookOpen className="h-7 w-7" />
          </span>
          <p className="font-bold">No lessons here yet</p>
          <p className="max-w-xs text-sm text-gray-600">
            Lessons you are meant to see will show up on this page as they are published. The public guides are
            open in the meantime.
          </p>
          <Link
            href="/guides"
            className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover"
          >
            Read the public guides
          </Link>
        </div>
      ) : (
        <ol className="flex flex-col gap-4">
          {guides.map((g, i) => (
            <li key={g.id} className="overflow-hidden rounded-2xl border border-brand-light/70 bg-white shadow-card">
              {g.youtube_url && <YoutubeLite url={g.youtube_url} title={g.title} />}
              <div className="p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-deep">Lesson {i + 1}</p>
                <h2 className="mt-0.5 text-lg font-extrabold leading-snug">{g.title}</h2>
                {g.description && (
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">{g.description}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
