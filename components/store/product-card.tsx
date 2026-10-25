import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/store/format";
import { buildOrderUrl } from "@/lib/store/whatsapp";
import { productHref } from "@/lib/store/slug";
import type { StoreProduct } from "@/types/store";
import { SafeImg } from "./safe-img";

type Props = {
  product: StoreProduct;
  username: string;
  whatsapp: string | null; // profiles.whatsapp (digits only)
  storeName: string;
  /** tile = featured strip (square photo on top), row = shop list (photo left, like the Canva mock). */
  variant?: "tile" | "row";
  categoryName?: string | null;
};

function Placeholder({ className }: { className: string }) {
  return (
    <div className={`flex items-center justify-center bg-store-text/5 text-store-text/40 ${className}`}>
      <ShoppingBag className="h-8 w-8" />
    </div>
  );
}

/**
 * Product card. The photo and the title are two separate links to the product page; the WhatsApp button
 * is its own link (no nested anchors). Everything on the card leads somewhere useful.
 */
export function ProductCard({ product, username, whatsapp, storeName, variant = "tile", categoryName }: Props) {
  const href = productHref(username, product);
  const cover = product.images[0];
  const price = formatPrice(product.price, product.currency);
  const orderUrl = whatsapp
    ? buildOrderUrl({ whatsapp, storeName, productName: product.name, price, path: href })
    : null;

  const image = (cls: string, eager = false) =>
    cover ? (
      <SafeImg
        key={cover.url}
        src={cover.url}
        alt={cover.alt || product.name}
        eager={eager}
        className={`${cls} object-cover`}
        fallback={<Placeholder className={cls} />}
      />
    ) : (
      <Placeholder className={cls} />
    );

  const cta = orderUrl ? (
    <a
      href={orderUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 flex-1 items-center justify-center rounded-full bg-store-primary px-3 text-xs font-bold text-store-on-primary transition-opacity hover:opacity-90"
    >
      Order on WhatsApp
    </a>
  ) : (
    <Link
      href={href}
      className="flex h-10 flex-1 items-center justify-center rounded-full bg-store-primary px-3 text-xs font-bold text-store-on-primary"
    >
      View product
    </Link>
  );

  if (variant === "row") {
    return (
      <article className="flex gap-3 overflow-hidden rounded-2xl border border-store-text/10 bg-store-bg p-2.5 shadow-sm">
        <Link href={href} className="relative block h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-store-text/5" tabIndex={-1} aria-hidden="true">
          {image("h-28 w-28")}
          {product.images.length > 1 && (
            <span className="absolute bottom-1 right-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {product.images.length} photos
            </span>
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          {categoryName && <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-store-text/65">{categoryName}</p>}
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug">
            <Link href={href} className="hover:underline">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-base font-extrabold text-store-primary">{price}</p>
          <div className="mt-auto flex gap-2 pt-2">{cta}</div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-store-text/10 bg-store-bg shadow-sm">
      <Link href={href} className="block overflow-hidden bg-store-text/5" tabIndex={-1} aria-hidden="true">
        {image("aspect-square w-full", true)}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug">
          <Link href={href} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm font-extrabold text-store-primary">{price}</p>
        <div className="mt-auto flex pt-2">{cta}</div>
      </div>
    </article>
  );
}
