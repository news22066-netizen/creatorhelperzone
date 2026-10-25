import { createClient } from "@/lib/supabase/server";
import type { DashboardGuide, GuideAudience } from "@/types/database";

/** Active lessons for one dashboard (audience = that role or "both"), in the admin's order. Never throws. */
export async function getDashboardGuides(role: Exclude<GuideAudience, "both">): Promise<DashboardGuide[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dashboard_guides")
      .select("*")
      .eq("is_active", true)
      .in("audience", [role, "both"])
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as DashboardGuide[];
  } catch {
    return [];
  }
}
