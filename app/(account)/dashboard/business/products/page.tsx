import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { requireBusiness } from "@/lib/auth/business-access";
import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/store/data";
import { formatPrice } from "@/lib/store/format";
import type { StoreCategory } from "@/types/store";
import { SafeImg } from "@/components/store/safe-img";
import { CategoriesManager } from "@/components/business/categories-manager";
import { ProductRowActions } from "@/components/business/product-row-actions";

export const metadata = { title: "Products" };

export default async function BusinessProductsPage() {
  const { profile } = await requireBusiness();
  const supabase = await createClient();

  // Owner view: RLS returns ALL of this owner's products, including hidden ones.
  const [{ data: rows }, { data: cats }] = await Promise.all([
    supabase
      .from("store_products")
      .select("*, store_product_images(id, product_id, url, alt, sort_order, created_at)")
      .eq("user_id", profile.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("store_categories").select("*").eq("user_id", profile.id).order("sort_order", { ascending: true }),
  ]);

  const products = ((rows ?? []) as Parameters<typeof mapProduct>[0][]).map(mapProduct);
  const categories = (cats ?? []) as StoreCategory[];
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Products</h1>
        <Link
          href="/dashboard/business/products/new"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-light bg-brand-light/10 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light/50">
            <Package className="h-7 w-7" />
          </span>
          <p className="font-bold">No products yet</p>
          <p className="max-w-xs text-sm text-gray-600">
            Add a product with a name, a price and photo links. Customers order it on WhatsApp.
          </p>
          <Link
            href="/dashboard/business/products/new"
            className="mt-1 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-brand-light/70 bg-white p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-light/30">
                {p.images[0] ? (
                  <SafeImg
                    src={p.images[0].url}
                    alt=""
                    className="h-full w-full object-cover"
                    fallback={
                      <span className="flex h-full w-full items-center justify-center text-gray-400">
                        <Package className="h-6 w-6" />
                      </span>
                    }
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-gray-400">
                    <Package className="h-6 w-6" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className="text-sm font-semibold text-brand-deep">{formatPrice(p.price, p.currency)}</p>
                {p.slug && (
                  <p className="truncate text-xs text-gray-500">
                    {p.is_active ? (
                      <Link href={`/${profile.username}/shop/${p.slug}`} target="_blank" className="underline">
                        /{profile.username}/shop/{p.slug}
                      </Link>
                    ) : (
                      <>/{profile.username}/shop/{p.slug}</>
                    )}
                  </p>
                )}
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                  {p.category_id && catName.get(p.category_id) && <span>{catName.get(p.category_id)}</span>}
                  <span>{p.images.length} photo{p.images.length === 1 ? "" : "s"}</span>
                  {!p.is_active && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-gray-600">
                      Hidden
                    </span>
                  )}
                </p>
              </div>
              <ProductRowActions id={p.id} name={p.name} active={p.is_active} />
            </li>
          ))}
        </ul>
      )}

      <CategoriesManager categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
