import { requireCreator } from "@/lib/auth/creator-access";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_APPEARANCE } from "@/lib/creator/appearance";
import { parseCreatorSettings } from "@/lib/creator/links";
import { ProfileForm } from "@/components/account/profile-form";
import { LinksManager } from "@/components/account/links-manager";
import { CreatorContactForm } from "@/components/creator/creator-contact-form";
import { VideosManager } from "@/components/creator/videos-manager";
import type { ProfileLink } from "@/types/database";
import type { CreatorVideo } from "@/types/creator";

export const metadata = { title: "Creator profile" };

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-brand-light/70 bg-white p-4">
      <div>
        <h2 className="text-lg font-extrabold">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-gray-600">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export default async function CreatorProfilePage() {
  const { profile } = await requireCreator();
  const supabase = await createClient();

  const [settings, linkRows, videoRows] = await Promise.all([
    supabase.from("creator_settings").select("*").eq("profile_id", profile.id).maybeSingle(),
    supabase
      .from("profile_links")
      .select("*")
      .eq("user_id", profile.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("creator_videos")
      .select("*")
      .eq("user_id", profile.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold">Profile</h1>

      <Card title="Basics" hint="Your name, photo, bio and WhatsApp number. WhatsApp powers every message button on your page.">
        <ProfileForm
          fullName={profile.full_name ?? ""}
          bio={profile.bio ?? ""}
          avatarUrl={profile.avatar_url ?? ""}
          whatsapp={profile.whatsapp ?? ""}
        />
      </Card>

      <Card title="About & get in touch" hint="The About text, email, phone and social icons. Only what you fill in is shown.">
        <CreatorContactForm settings={parseCreatorSettings(settings.data as Record<string, unknown> | null, DEFAULT_APPEARANCE)} />
      </Card>

      <Card title="Link buttons" hint="Extra buttons under your name (your shop, a blog post, a booking page...). Add as many as you need, up to 20.">
        <LinksManager links={(linkRows.data ?? []) as ProfileLink[]} />
      </Card>

      <Card title="Latest YouTube videos" hint="Shown on your Home page. YouTube links only.">
        <VideosManager videos={((videoRows.data ?? []) as CreatorVideo[]).map((v) => ({ id: v.id, url: v.url, title: v.title }))} />
      </Card>
    </div>
  );
}
