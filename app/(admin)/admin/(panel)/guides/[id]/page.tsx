import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuideForm } from "@/components/admin/guide-form";
import type { Guide } from "@/types/database";

export const metadata = { title: "Edit Guide" };

export default async function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("guides").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Edit guide</h1>
      <GuideForm guide={data as Guide} />
    </div>
  );
}
