import { createClient } from "@/lib/supabase/server";
import { FaqManager } from "@/components/admin/faq-manager";
import type { Faq } from "@/types/database";

export const metadata = { title: "Manage FAQs" };

export default async function AdminFaqsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">FAQs</h1>
      <FaqManager faqs={(data ?? []) as Faq[]} />
    </div>
  );
}
