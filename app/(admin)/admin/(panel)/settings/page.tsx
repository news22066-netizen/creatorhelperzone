import { createClient } from "@/lib/supabase/server";
import { SettingsPanel } from "@/components/admin/settings-panel";
import { parseSettings } from "@/lib/data/settings";
import type { Announcement } from "@/types/database";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [{ data: settingsRows }, { data: announcements }] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  const settings = parseSettings(settingsRows);

  return <SettingsPanel settings={settings} announcements={(announcements ?? []) as Announcement[]} />;
}
