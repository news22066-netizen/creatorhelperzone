import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import {
  getStoreCategories,
  getStoreFaqs,
  getStoreProducts,
  type StoreView,
} from "@/lib/store/data";
import { SafeImg } from "./safe-img";
import { ProductCard } from "./product-card";
import { FaqItem } from "./faq-item";
import { VideoEmbed } from "./video-embed";
import { WhatsAppCta } from "./whatsapp-cta";

/**
 * STORE HOME: /[username] when role = 'business'. Order follows the Canva mock:
 * featured products (slide) → photos → categories → YouTube → FAQ → footer.
 * Each block is controlled by the owner's visibility flag (view.sections). A hidden block is never
 * rendered, and its data is not even fetched.
 */
export async function StoreHome({ view }: { view: StoreView }) {
  const { profile, displayName, sections } = view;
  const username = profile.username;

  // Products are needed by two blocks (featured + photo row). Skip the query when both are hidden.
  const needProducts = sections.show_featured_products || sections.show_photo_row;
  const [products, categories, faqs] = await Promise.all([
    needProducts ? getStoreProducts(profile.id) : Promise.resolve([]),
    sections.show_categories ? getStoreCategories(profile.id) : Promise.resolve([]),
    sections.show_faq ? getStoreFaqs(profile.id) : Promise.resolve([]),
  ]);

  const featured = products.slice(0, 10);
  const photos = products
    .flatMap((p) => p.images.slice(1).map((img) => ({ id: img.id, url: img.url, alt: img.alt || p.name })))
    .slice(0, 10);
  const shopHref = `/${username}/shop`;
  const initial = displayName.replace(/^@/, "").charAt(0).toUpperCase() || "S";

  const avatarFallback = (
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-store-primary text-2xl font-extrabold text-store-on-primary">
      {initial}
    </span>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Intro: kept compact so products come first, like the mock */}
      <section className="flex items-center gap-3 rounded-2xl border border-store-text/10 p-3">
        {profile.avatar_url ? (
          <SafeImg
            src={profile.avatar_url}
            alt={displayName}
            eager
            className="h-14 w-14 shrink-0 rounded-full border border-store-text/10 object-cover"
            fallback={avatarFallback}
          />
        ) : (
          avatarFallback
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-extrabold leading-tight">{displayName}</h1>
          {profile.bio ? (
            <p className="line-clamp-2 text-sm leading-snug text-store-text/80">{profile.bio}</p>
          ) : (
            <p className="text-sm text-store-text/70">Order directly on WhatsApp.</p>
          )}
        </div>
      </section>

      {/* Featured products: horizontal slide */}
      {sections.show_featured_products && (
        <section aria-label="Featured products">
          {featured.length > 0 ? (
            <>
              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-lg font-extrabold">Featured products</h2>
                <Link href={shopHref} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-store-primary">
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
                {featured.map((p) => (
                  <li key={p.id} className="w-44 shrink-0 snap-start">
                    <ProductCard product={p} username={username} whatsapp={profile.whatsapp} storeName={displayName} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-store-text/30 px-5 py-10 text-center">
              <ShoppingBag className="h-8 w-8 text-store-text/50" />
              <p className="font-bold">No products yet</p>
              <p className="max-w-xs text-sm text-store-text/75">
                {profile.whatsapp
                  ? "No products are listed yet. Message them on WhatsApp to ask what is available."
                  : "No products are listed yet."}
              </p>
              {profile.whatsapp && (
                <div className="mt-2 w-full max-w-xs">
                  <WhatsAppCta whatsapp={profile.whatsapp} storeName={displayName} />
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Photo row (needs a few pictures to look right) */}
      {sections.show_photo_row && photos.length >= 3 && (
        <section aria-label="Photos">
          <h2 className="mb-3 text-lg font-extrabold">Photos</h2>
          <ul className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4">
            {photos.map((ph) => (
              <li key={ph.id} className="h-32 w-32 shrink-0 snap-start overflow-hidden rounded-2xl bg-store-text/5">
                <SafeImg src={ph.url} alt={ph.alt} className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Categories entry */}
      {sections.show_categories && categories.length > 0 && (
        <section aria-label="Categories">
          <h2 className="mb-3 text-lg font-extrabold">Categories</h2>
          <ul className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`${shopHref}?category=${c.id}`}
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-store-text/20 px-4 text-sm font-semibold transition-colors hover:border-store-primary hover:text-store-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* YouTube embed (owner pastes a link in Settings) */}
      {sections.show_youtube && view.youtubeUrl && (
        <section aria-label="Video">
          <h2 className="mb-3 text-lg font-extrabold">Watch</h2>
          <VideoEmbed url={view.youtubeUrl} title={`${displayName} video`} />
        </section>
      )}

      {/* Short FAQ */}
      {sections.show_faq && faqs.length > 0 && (
        <section aria-label="FAQ">
          <h2 className="mb-1 text-lg font-extrabold">Questions</h2>
          <div className="rounded-2xl border border-store-text/10 px-4">
            {faqs.map((f) => (
              <FaqItem key={f.id} faq={f} />
            ))}
          </div>
        </section>
      )}

      <StoreFooter username={username} />
    </div>
  );
}

export function StoreFooter({ username }: { username: string }) {
  return (
    <footer className="border-t border-store-text/10 pt-4 text-xs text-store-text/70">
      <Link href={`/${username}/privacy`} className="inline-flex min-h-11 items-center underline">
        Privacy
      </Link>
      <span className="mx-2">·</span>
      <span>
        Powered by{" "}
        <Link href="/" className="font-semibold underline">
          BFEED
        </Link>
      </span>
    </footer>
  );
}
