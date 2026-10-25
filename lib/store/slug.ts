/** Same rule as the DB (make_product_slug in 0008): a-z 0-9 and single hyphens, max 80. */
export const PRODUCT_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PRODUCT_SLUG_MAX = 80;

/** "Red Cotton T-Shirt!" -> "red-cotton-t-shirt". Returns "" when nothing latin is left (e.g. Bangla-only names). */
export function productSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

export function isValidProductSlug(v: string): boolean {
  return v.length > 0 && v.length <= PRODUCT_SLUG_MAX && PRODUCT_SLUG_RE.test(v);
}

/** Public URL of a product page. Falls back to the id if a row has no slug yet (migration 0008 not run). */
export function productHref(username: string, p: { slug?: string | null; id: string }): string {
  return `/${username}/shop/${p.slug || p.id}`;
}
