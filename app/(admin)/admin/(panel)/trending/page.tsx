import { createClient } from "@/lib/supabase/server";
import { TrendingManager } from "@/components/admin/trending-manager";
import type { TrendingItem } from "@/types/database";

export const metadata = { title: "Manage Trending" };

export default async function AdminTrendingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trending_items")
    .select("*")
    .order("week_label", { ascending: false })
    .order("sort_order", { ascending: true });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Trending</h1>
      <p className="text-sm text-muted-foreground">
        Add YouTube videos (URL auto-embeds), keywords and thumbnail ideas. Group them with the same week label, e.g. 2026-W43.
      </p>
      <TrendingManager items={(data ?? []) as TrendingItem[]} />
    </div>
  );
}
