import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchX, ShoppingBag } from "lucide-react";
import { getStoreCategories, getStoreProducts, getStoreView } from "@/lib/store/data";
import { isUuid } from "@/lib/utils/validate";
import { cn } from "@/lib/utils/cn";
import { ProductCard } from "@/components/store/product-card";
import { ShopSearch } from "@/components/store/shop-search";
import { StoreFooter } from "@/components/store/store-home";

// Uses ?q= and ?category=, so this route renders per request (still anonymous, no cookies).
type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ q?: string; category?: string; focus?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { username } = await params;
  const view = await getStoreView(username);
  if (!view) return { title: "Page not found", robots: { index: false } };
  return { title: `Shop · ${view.displayName}`, description: `Products from ${view.displayName}. Order on WhatsApp.` };
}

export default async function StoreShopPage({ params, searchParams }: Props) {
  const { username } = await params;
  const sp = await searchParams;
  const view = await getStoreView(username);
  if (!view) notFound();

  const { sections } = view;
  // A hidden search / category block also ignores its query-string, so a stale link cannot bring it back.
  const q = sections.show_search_on_shop ? (sp.q ?? "").trim().slice(0, 60) : "";
  const category = sections.show_categories && sp.category && isUuid(sp.category) ? sp.category : undefined;

  const [all, categories] = await Promise.all([
    getStoreProducts(view.profile.id),
    sections.show_categories ? getStoreCategories(view.profile.id) : Promise.resolve([]),
  ]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  // Filtering in memory (max 100 products per store): no query-string injection surface.
  const needle = q.toLowerCase();
  const products = all.filter(
    (p) =>
      (!category || p.category_id === category) &&
      (!needle || `${p.name} ${p.description}`.toLowerCase().includes(needle))
  );

  const base = `/${username}/shop`;
  const chipHref = (cat?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    const s = params.toString();
    return s ? `${base}?${s}` : base;
  };
  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-11 shrink-0 items-center rounded-full border-2 px-4 text-sm font-semibold transition-colors",
      active
        ? "border-store-primary bg-store-primary text-store-on-primary"
        : "border-store-text/20 hover:border-store-primary"
    );

  return (
    <div className="flex flex-col gap-4">
      {sections.show_search_on_shop && (
        <ShopSearch username={username} initialQuery={q} category={category} autoFocus={sp.focus === "1"} />
      )}

      {categories.length > 0 && (
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" aria-label="Categories">
          <Link href={chipHref()} className={chip(!category)} aria-current={!category ? "true" : undefined}>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={chipHref(c.id)}
              className={chip(category === c.id)}
              aria-current={category === c.id ? "true" : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-extrabold">Shop</h1>
        {all.length > 0 && (
          <p className="text-sm text-store-text/70">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-store-text/30 px-5 py-12 text-center">
          {all.length === 0 ? (
            <ShoppingBag className="h-8 w-8 text-store-text/50" />
          ) : (
            <SearchX className="h-8 w-8 text-store-text/50" />
          )}
          <p className="font-bold">{all.length === 0 ? "No products yet" : "No products match"}</p>
          <p className="max-w-xs text-sm text-store-text/75">
            {all.length === 0
              ? "This store has not added products yet. Check back soon."
              : "Try a different word or pick another category."}
          </p>
          {all.length > 0 && (
            <Link href={base} className="mt-2 inline-flex h-11 items-center rounded-full bg-store-primary px-5 text-sm font-bold text-store-on-primary">
              Show all products
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard
                variant="row"
                product={p}
                username={username}
                whatsapp={view.profile.whatsapp}
                storeName={view.displayName}
                categoryName={p.category_id ? catName.get(p.category_id) : null}
              />
            </li>
          ))}
        </ul>
      )}

      <StoreFooter username={username} />
    </div>
  );
}
