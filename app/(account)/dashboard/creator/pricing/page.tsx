import { requireCreator } from "@/lib/auth/creator-access";
import { createClient } from "@/lib/supabase/server";
import { PlansManager } from "@/components/creator/plans-manager";
import type { CreatorPlan } from "@/types/creator";

export const metadata = { title: "Pricing" };

export default async function CreatorPricingPage() {
  const { profile } = await requireCreator();
  const supabase = await createClient();
  const { data } = await supabase
    .from("creator_plans")
    .select("*")
    .eq("user_id", profile.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold">Pricing</h1>
        <p className="mt-1 text-sm text-gray-600">
          Plans you offer. Each plan&apos;s button opens WhatsApp with a ready message (plan name and price). There is no checkout:
          you agree and get paid with your customer directly.
          {!profile.whatsapp && (
            <strong className="text-amber-700"> Add your WhatsApp number in Profile first, or the buttons cannot work.</strong>
          )}
        </p>
      </div>
      <PlansManager plans={(data ?? []) as CreatorPlan[]} />
    </div>
  );
}
