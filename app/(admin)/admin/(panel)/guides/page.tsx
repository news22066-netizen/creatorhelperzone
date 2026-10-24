import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import { GuideDeleteButton } from "@/components/admin/guide-delete-button";
import type { Guide, PublishStatus } from "@/types/database";

export const metadata = { title: "Manage Guides" };

const statusVariant: Record<PublishStatus, "green" | "secondary" | "destructive"> = {
  published: "green",
  draft: "secondary",
  unpublished: "destructive",
};

export default async function AdminGuidesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("guides")
    .select("id, slug, title, status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Guides</h1>
        <Link
          href="/admin/guides/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New guide
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {(data ?? []).map((g: Pick<Guide, "id" | "slug" | "title" | "status" | "updated_at">) => (
          <div key={g.id} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant[g.status]}>{g.status}</Badge>
                <span className="text-xs text-muted-foreground">/{g.slug}</span>
              </div>
              <p className="mt-1 truncate font-semibold">{g.title}</p>
              <p className="text-xs text-muted-foreground">Updated {formatDate(g.updated_at)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href={`/admin/guides/${g.id}`}
                className="inline-flex items-center rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
              >
                Edit
              </Link>
              <GuideDeleteButton id={g.id} />
            </div>
          </div>
        ))}
        {(data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No guides yet — write the first one.</p>
        )}
      </div>
    </div>
  );
}
