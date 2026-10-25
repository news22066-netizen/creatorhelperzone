import { requireBusiness } from "@/lib/auth/business-access";
import { createClient } from "@/lib/supabase/server";
import { parseTheme } from "@/lib/store/theme";
import { parseSections } from "@/lib/store/sections";
import { StoreSettingsForm } from "@/components/business/store-settings-form";
import { FaqManager } from "@/components/business/faq-manager";
import type { StoreFaq } from "@/types/store";

export const metadata = { title: "Store settings" };

export default async function BusinessSettingsPage() {
  const { profile } = await requireBusiness();
  const supabase = await createClient();
  const [{ data }, { data: faqRows }] = await Promise.all([
    supabase.from("store_settings").select("*").eq("profile_id", profile.id).maybeSingle(),
    supabase.from("store_faqs").select("*").eq("user_id", profile.id).order("sort_order", { ascending: true }),
  ]);
  const row = (data ?? {}) as { display_name?: string; theme?: unknown; youtube_url?: string | null; sections?: unknown };
  const faqs = (faqRows ?? []) as StoreFaq[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold">Store settings</h1>
        <StoreSettingsForm
          displayName={row.display_name ?? ""}
          theme={parseTheme(row.theme)}
          youtubeUrl={row.youtube_url ?? ""}
          sections={parseSections(row.sections)}
          fallbackName={profile.full_name ?? `@${profile.username}`}
        />
      </div>
      <FaqManager faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />
    </div>
  );
}
