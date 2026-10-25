import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireBusiness } from "@/lib/auth/business-access";
import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/store/data";
import { isUuid } from "@/lib/utils/validate";
import { ProductForm } from "@/components/business/product-form";
import { DeleteProductButton } from "@/components/business/product-row-actions";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireBusiness();
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  // Ownership in the query itself (and RLS behind it): a foreign or unknown id is a plain 404, never leaked.
  const [{ data: row }, { data: cats }] = await Promise.all([
    supabase
      .from("store_products")
      .select("*, store_product_images(id, product_id, url, alt, sort_order, created_at)")
      .eq("id", id)
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase.from("store_categories").select("id, name").eq("user_id", profile.id).order("sort_order", { ascending: true }),
  ]);
  if (!row) notFound();
  const product = mapProduct(row as Parameters<typeof mapProduct>[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Edit product</h1>
        {product.is_active && (
          <Link
            href={`/${profile.username}/shop/${product.slug || product.id}`}
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input px-3 text-sm font-semibold hover:bg-brand-light/20"
          >
            <ExternalLink className="h-4 w-4" /> View page
          </Link>
        )}
      </div>
      <ProductForm
        username={profile.username}
        categories={(cats ?? []) as { id: string; name: string }[]}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug ?? "",
          price: String(product.price),
          currency: product.currency,
          description: product.description,
          category_id: product.category_id,
          is_active: product.is_active,
          sort_order: product.sort_order,
          images: product.images.map((i) => i.url),
        }}
      />
      <div className="mt-2 border-t border-gray-200 pt-4">
        <DeleteProductButton id={product.id} name={product.name} />
      </div>
    </div>
  );
}
