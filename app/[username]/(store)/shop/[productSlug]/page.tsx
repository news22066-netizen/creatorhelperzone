import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { SITE_URL } from "@/lib/constants";
import { getStoreCategories, getStoreProductBySlug, getStoreView } from "@/lib/store/data";
import { formatPrice } from "@/lib/store/format";
import { buildOrderUrl } from "@/lib/store/whatsapp";
import { productHref } from "@/lib/store/slug";
import { ProductGallery } from "@/components/store/product-gallery";
import { ShareButton } from "@/components/store/share-button";
import { StoreFooter } from "@/components/store/store-home";

/**
 * /[username]/shop/[productSlug]
 * 404 when the store does not exist / is a creator, when the slug belongs to another store, or when the
 * product is hidden (is_active = false): the lookup filters by store and active, and RLS repeats it.
 */
export const revalidate = 30;

type Props = { params: Promise<{ username: string; productSlug: string }> };

async function load(username: string, productSlug: string) {
  const view = await getStoreView(username);
  if (!view) return null;
  let slug = productSlug;
  try {
    slug = decodeURIComponent(productSlug);
  } catch {
    return null;
  }
  const product = await getStoreProductBySlug(view.profile.id, slug);
  return product ? { view, product } : null;
}

function metaDescription(text: string, fallback: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return fallback;
  return t.length > 155 ? `${t.slice(0, 152).trimEnd()}...` : t;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, productSlug } = await params;
  const found = await load(username, productSlug);
  if (!found) return { title: "Product not found", robots: { index: false } };

  const { view, product } = found;
  const price = formatPrice(product.price, product.currency);
  const title = `${product.name} · ${view.displayName}`;
  const description = metaDescription(product.description, `${product.name} for ${price} from ${view.displayName}. Order on WhatsApp.`);
  const canonical = `${SITE_URL}${productHref(username, product)}`;
  const image = product.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title, description, images: image ? [image] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function StoreProductPage({ params }: Props) {
  const { username, productSlug } = await params;
  const found = await load(username, productSlug);
  if (!found) notFound();

  const { view, product } = found;
  // Opened by id (old link / before the slug migration)? Send people to the one canonical URL.
  if (product.slug && product.slug !== productSlug) permanentRedirect(productHref(username, product));

  const { profile, displayName, sections } = view;
  const price = formatPrice(product.price, product.currency);
  const url = `${SITE_URL}${productHref(username, product)}`;

  let categoryName: string | null = null;
  if (product.category_id && sections.show_categories) {
    const cats = await getStoreCategories(profile.id);
    categoryName = cats.find((c) => c.id === product.category_id)?.name ?? null;
  }

  const orderUrl = profile.whatsapp
    ? buildOrderUrl({ whatsapp: profile.whatsapp, storeName: displayName, productName: product.name, price, link: url })
    : null;

  // schema.org Product for search engines. "<" is escaped so the text can never close the script tag.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.images.map((i) => i.url),
    category: categoryName ?? undefined,
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
    },
  }).replace(/</g, "\\u003c");

  return (
    <article className="flex flex-col gap-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <nav aria-label="Breadcrumb">
        <Link href={`/${username}/shop`} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-store-primary">
          <ChevronLeft className="h-4 w-4" /> Back to shop
        </Link>
      </nav>

      <ProductGallery
        name={product.name}
        images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))}
      />

      <header className="flex flex-col gap-1.5">
        {categoryName && (
          <Link
            href={`/${username}/shop?category=${product.category_id}`}
            className="w-fit rounded-full bg-store-text/10 px-3 py-1 text-xs font-bold uppercase tracking-wide hover:bg-store-text/15"
          >
            {categoryName}
          </Link>
        )}
        <h1 className="text-2xl font-extrabold leading-tight">{product.name}</h1>
        <p className="text-2xl font-extrabold text-store-primary">{price}</p>
      </header>

      {product.description && (
        <section aria-label="Description" className="flex flex-col gap-1.5">
          <h2 className="text-base font-extrabold">Description</h2>
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-store-text/85">{product.description}</p>
        </section>
      )}

      {/* Order CTA */}
      <div className="flex flex-col gap-2">
        {orderUrl ? (
          <a
            href={orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-store-primary text-base font-bold text-store-on-primary shadow-sm transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-5 w-5" />
            Order on WhatsApp
          </a>
        ) : (
          <Link
            href={`/${username}/contact`}
            className="flex h-14 items-center justify-center rounded-full bg-store-primary text-base font-bold text-store-on-primary"
          >
            Contact the store to order
          </Link>
        )}
        <p className="text-center text-xs text-store-text/70">
          Opens WhatsApp with your order message ready. No online payment.
        </p>
        <ShareButton
          url={url}
          title={product.name}
          className="mx-auto inline-flex h-11 items-center gap-2 rounded-full border-2 border-store-text/20 px-5 text-sm font-semibold hover:bg-store-text/5"
        >
          Share this product
        </ShareButton>
      </div>

      <StoreFooter username={username} />
    </article>
  );
}
