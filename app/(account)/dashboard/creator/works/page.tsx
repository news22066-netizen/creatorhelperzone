import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { requireCreator } from "@/lib/auth/creator-access";
import { createClient } from "@/lib/supabase/server";
import { WORK_SELECT, mapWork } from "@/lib/creator/data";
import { SafeImg } from "@/components/store/safe-img";
import { WorkRowActions } from "@/components/creator/work-row-actions";

export const metadata = { title: "Works" };

export default async function CreatorWorksPage() {
  const { profile } = await requireCreator();
  const supabase = await createClient();

  // Owner view: RLS returns ALL of this owner's works, including hidden ones.
  const { data } = await supabase
    .from("creator_works")
    .select(WORK_SELECT)
    .eq("user_id", profile.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const works = ((data ?? []) as Parameters<typeof mapWork>[0][]).map(mapWork);

  const placeholder = (
    <span className="flex h-full w-full items-center justify-center text-gray-400">
      <Briefcase className="h-6 w-6" />
    </span>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Works</h1>
        <Link href="/dashboard/creator/works/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover">
          <Plus className="h-4 w-4" /> Add work
        </Link>
      </div>

      {works.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-light bg-brand-light/10 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light/50">
            <Briefcase className="h-7 w-7" />
          </span>
          <p className="font-bold">No works yet</p>
          <p className="max-w-xs text-sm text-gray-600">
            Add projects with photo links and an optional YouTube video. Visitors tap a work to open it in a popup.
          </p>
          <Link href="/dashboard/creator/works/new" className="mt-1 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover">
            Add your first work
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {works.map((w) => (
            <li key={w.id} className="flex items-center gap-3 rounded-2xl border border-brand-light/70 bg-white p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-light/30">
                {w.images[0] ? (
                  <SafeImg src={w.images[0].url} alt="" className="h-full w-full object-cover" fallback={placeholder} />
                ) : (
                  placeholder
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{w.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                  <span>
                    {w.images.length} photo{w.images.length === 1 ? "" : "s"}
                  </span>
                  {w.youtube_url && <span>video</span>}
                  {!w.is_active && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-gray-600">Hidden</span>
                  )}
                </p>
              </div>
              <WorkRowActions id={w.id} title={w.title} active={w.is_active} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
