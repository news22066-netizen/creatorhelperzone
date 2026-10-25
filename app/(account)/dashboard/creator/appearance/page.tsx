import { requireCreator } from "@/lib/auth/creator-access";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_APPEARANCE, getPreset } from "@/lib/creator/appearance";
import { AppearancePicker } from "@/components/creator/appearance-picker";

export const metadata = { title: "Appearance" };

export default async function CreatorAppearancePage() {
  const { profile } = await requireCreator();
  const supabase = await createClient();
  const { data } = await supabase.from("creator_settings").select("*").eq("profile_id", profile.id).maybeSingle();
  const current = getPreset((data as { appearance?: string } | null)?.appearance ?? DEFAULT_APPEARANCE).id;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold">Appearance</h1>
        <p className="mt-1 text-sm text-gray-600">
          Pick a color or gradient for your public page. Text and buttons adjust automatically so everything stays easy to read.
        </p>
      </div>
      <AppearancePicker current={current} name={profile.full_name || `@${profile.username}`} />
    </div>
  );
}
