import { requireBusiness } from "@/lib/auth/business-access";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/business/product-form";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const { profile } = await requireBusiness();
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_categories")
    .select("id, name")
    .eq("user_id", profile.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Add product</h1>
      <ProductForm username={profile.username} categories={(data ?? []) as { id: string; name: string }[]} />
    </div>
  );
}
