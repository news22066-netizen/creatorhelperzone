import Link from "next/link";
import { requireBusiness } from "@/lib/auth/business-access";
import { createClient } from "@/lib/supabase/server";
import { PrivacyForm } from "@/components/business/privacy-form";

export const metadata = { title: "Privacy policy" };

export default async function BusinessPrivacyPage() {
  const { profile } = await requireBusiness();
  const supabase = await createClient();
  const { data } = await supabase.from("store_privacy").select("content").eq("user_id", profile.id).maybeSingle();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold">Privacy policy</h1>
        <p className="mt-1 text-sm text-gray-600">
          Shown publicly at{" "}
          <Link href={`/${profile.username}/privacy`} target="_blank" className="font-semibold text-brand-deep underline">
            /{profile.username}/privacy
          </Link>{" "}
          and linked from your store footer.
        </p>
      </div>
      <PrivacyForm content={(data as { content?: string } | null)?.content ?? ""} storeName={profile.full_name ?? profile.username} />
    </div>
  );
}
