import Link from "next/link";
import { requireBusiness } from "@/lib/auth/business-access";
import { createClient } from "@/lib/supabase/server";
import { parseContact } from "@/lib/store/contact";
import { ProfileForm } from "@/components/account/profile-form";
import { ContactLinksForm } from "@/components/business/contact-links-form";

export const metadata = { title: "Profile & Contact" };

export default async function BusinessProfilePage() {
  const { profile } = await requireBusiness();
  const supabase = await createClient();
  const { data } = await supabase.from("store_settings").select("*").eq("profile_id", profile.id).maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Profile &amp; Contact</h1>
          <p className="mt-1 text-sm text-gray-600">
            Your WhatsApp number powers every &ldquo;Order on WhatsApp&rdquo; button. The avatar is your store logo. To
            change the name shown in the store header, use{" "}
            <Link href="/dashboard/business/settings" className="font-semibold text-brand-deep underline">
              Settings
            </Link>
            .
          </p>
        </div>
        {/* The same form creators use: one source of truth for name, bio, avatar link and WhatsApp. */}
        <ProfileForm
          fullName={profile.full_name ?? ""}
          bio={profile.bio ?? ""}
          avatarUrl={profile.avatar_url ?? ""}
          whatsapp={profile.whatsapp ?? ""}
        />
      </div>
      <ContactLinksForm contact={parseContact(data as Record<string, unknown> | null)} />
    </div>
  );
}
