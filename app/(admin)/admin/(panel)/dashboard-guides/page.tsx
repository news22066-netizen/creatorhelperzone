import { createClient } from "@/lib/supabase/server";
import { DashboardGuideManager } from "@/components/admin/dashboard-guide-manager";
import type { DashboardGuide } from "@/types/database";

export const metadata = { title: "Dashboard guides" };

export default async function AdminDashboardGuidesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dashboard_guides")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Dashboard guides</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Video lessons shown inside the creator and business dashboards (Guide tab). Different from the public
          Guides articles.
        </p>
      </div>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Could not load guides: {error.message}. Run supabase/migrations/0010_marketing_admin.sql first.
        </p>
      )}
      <DashboardGuideManager guides={(data ?? []) as DashboardGuide[]} />
    </div>
  );
}
