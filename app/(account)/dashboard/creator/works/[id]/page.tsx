import { notFound } from "next/navigation";
import { requireCreator } from "@/lib/auth/creator-access";
import { createClient } from "@/lib/supabase/server";
import { WORK_SELECT, mapWork } from "@/lib/creator/data";
import { isUuid } from "@/lib/utils/validate";
import { WorkForm } from "@/components/creator/work-form";
import { DeleteWorkButton } from "@/components/creator/work-row-actions";

export const metadata = { title: "Edit work" };

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireCreator();
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  // Ownership is part of the query (and RLS sits behind it): a foreign or unknown id is a plain 404.
  const { data: row } = await supabase.from("creator_works").select(WORK_SELECT).eq("id", id).eq("user_id", profile.id).maybeSingle();
  if (!row) notFound();
  const work = mapWork(row as Parameters<typeof mapWork>[0]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Edit work</h1>
      <WorkForm
        work={{
          id: work.id,
          title: work.title,
          description: work.description,
          youtube_url: work.youtube_url ?? "",
          link_url: work.link_url ?? "",
          is_active: work.is_active,
          sort_order: work.sort_order,
          images: work.images.map((i) => i.url),
        }}
      />
      <div className="mt-2 border-t border-gray-200 pt-4">
        <DeleteWorkButton id={work.id} title={work.title} />
      </div>
    </div>
  );
}
